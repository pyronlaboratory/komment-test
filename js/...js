const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};
const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};
const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};
const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};
const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};

const https = require('https');
const fs = require('fs');
const path = require('path');

const moment = require('moment');
const satellite = require('satellite.js');
const jspredict = require('jspredict');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const MIN_ELEVATION = 8;
const MIN_MAX_ELEVATION = 20;
const MAX_PASSES = null;

const sats = {
  'NOAA 15': 137.62,
  'NOAA 18': 137.9125,
  'NOAA 19': 137.1,
};

const TLEPATH = path.resolve(__dirname, 'TLE');

function loadTLE() {
  return new Promise((resolve, reject) => {
    let download = false;
    if (!fs.existsSync(TLEPATH)) {
      // If the TLE doesn't exist, download
      download = true;
    } else {
      // If the TLE does exist, check if it's new enough
      const stats = fs.statSync(TLEPATH);
      if (!stats || stats.mtimeMs < Date.now() - ONE_DAY_MS) {
        // Too old, download
        download = true;
      } else {
        resolve(fs.readFileSync(TLEPATH, 'utf8'));
      }
    }

    if (download) {
      console.log('Downloading new TLEs from celestrak.com');
      const file = fs.createWriteStream(TLEPATH);
      https.get(
        'https://celestrak.org/NORAD/elements/noaa.txt',
        (response) => {
          const stream = response.pipe(file);
          stream.on('finish', () => {
            resolve(fs.readFileSync(TLEPATH, 'utf8'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        },
      );
    }
  });
}

function getTransits(TLE, qth) {
  const TLELines = TLE.split('\r\n');
  let passes = [];
  TLELines.forEach((line, i) => {
    Object.keys(sats).forEach((satId) => {
      if (line.indexOf(satId) > -1) {
        const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
          TLELines[i + 2]
        }`;
        let trans = jspredict.transits(
          tle,
          qth,
          Date.now(),
          Date.now() + ONE_DAY_MS,
          MIN_ELEVATION,
          MAX_PASSES,
        );

        trans = trans
          .map((t) => {
            // predict returns start and duration based on the
            // Acquisition of Signal happening when elevation > 0
            // WXtoImg returns when AoS is based on elevation > MIN_ELEVATION
            let numIterations = 50;
            let observed = jspredict.observe(tle, qth, t.start);
            let current = t.start;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current += 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.duration -= current - t.start;
            t.start = current;

            numIterations = 50;
            observed = jspredict.observe(tle, qth, t.end);
            current = t.end;
            while (
              observed.elevation < MIN_ELEVATION &&
              numIterations-- > 0
            ) {
              current -= 0.01 * t.duration;
              observed = jspredict.observe(tle, qth, current);
            }
            t.end = current;
            t.duration = t.end - t.start;
            return t;
          })
          .map((t) => {
            const observationAtStart = jspredict.observe(
              tle,
              qth,
              t.start,
            );
            t.direction =
              observationAtStart.latitude > qth[0] ? 'S' : 'N';
            return t;
          })
          .map((t) => {
            t.satellite = satId;
            return t;
          })
          .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
        passes = passes.concat(trans);
      }
    });
  });

  passes.sort((a, b) => {
    return a.start - b.start;
  });

  passes = passes.map((pass) => {
    const countdown = moment(pass.start).diff(new Date());
    return {
      Satellite: pass.satellite,
      Freq: sats[pass.satellite].toFixed(4),
      Direction: pass.direction,
      'Max Elevation': `${Math.round(pass.maxElevation)}${
        pass.apexAzimuth > 180 ? 'W' : 'E'
      }`,
      Countdown:
        countdown < 10000
          ? 'Ongoing'
          : moment
              .utc(moment.duration(countdown).asMilliseconds())
              .format('HH:mm:ss'),
      'Start Time': moment(pass.start).format('MM-DD HH:mm:ss'),
      Duration: moment.utc(pass.duration).format('mm:ss'),
    };
  });
  return passes;
}

function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

function determinePass(qth, startTime) {
  return loadTLE().then((TLE) => {
    const TLELines = TLE.split('\r\n');
    let passes = [];
    TLELines.forEach((line, i) => {
      Object.keys(sats).forEach((satId) => {
        if (line.indexOf(satId) > -1) {
          const tle = `${TLELines[i]}\n${TLELines[i + 1]}\n${
            TLELines[i + 2]
          }`;
          let trans = jspredict.transits(
            tle,
            qth,
            startTime,
            startTime + 1000 * 60 * 20,
            MIN_ELEVATION,
            MAX_PASSES,
          );

          trans = trans
            .map((t) => {
              const observationAtStart = jspredict.observe(
                tle,
                qth,
                t.start,
              );
              t.direction =
                observationAtStart.latitude > qth[0] ? 'S' : 'N';
              return t;
            })
            .map((t) => {
              t.satellite = satId;
              return t;
            })
            .filter((t) => t.maxElevation >= MIN_MAX_ELEVATION);
          passes = passes.concat(trans);
        }
      });
    });
    if (passes.length > 0) {
      return passes[0];
    }
    return false;
  });
}

async function getSatellitePositions(pass, height) {
  const lineDuration = 500;
  const satPositions = [];

  const TLEs = await loadTLE();
  const TLELines = TLEs.split('\r\n');
  let tleLine1;
  let tleLine2;
  TLELines.forEach((line, i) => {
    if (line.indexOf(pass.satellite) > -1) {
      tleLine1 = TLELines[i + 1];
      tleLine2 = TLELines[i + 2];
    }
  });

  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  for (let i = 0; i < height; i++) {
    const time = new Date(pass.start + lineDuration * i);
    const positionAndVelocity = satellite.propagate(satrec, time);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(time);
    const satPos = satellite.eciToGeodetic(positionEci, gmst);
    satPositions.push([satPos.latitude, satPos.longitude]);
  }

  return satPositions;
}

module.exports = {
  listPasses,
  determinePass,
  getSatellitePositions,
};
