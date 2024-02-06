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

/**
 * @description The function loadTLE is a promise-based function that determines if
 * a satellite's TLE (Two Line Element) exists and is up-to-date. If the TLE does not
 * exist or is older than one day it will download the latest TLE from
 * celestrak.org/NORAD/elements/noaa.txt. Once the file is downloaded and saved to
 * the TLEPATH file location the function returns the TLE file's contents using the
 * fs.readFileSync() method
 * 
 * @returns { string } The `loadTLE()` function returns a promise that resolves with
 * a string containing the TLE data or rejects with an error if there was an issue
 * downloading the data.
 */
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

/**
 * @description The function takes two arguments: TLE (Two-Line Elements) and qth
 * (ground track point), and returns an array of passes consisting of information
 * such as the satellite name( satellite information will not be included when providing
 * a response here but is contained within the sats object)
 * Direction( E/W direction based on apex Azimuth)
 * Frequency( exact or to fixed four decimal places depending upon apexAzimuth
 * orientation to cardinal directions)
 * Max Elevation
 * Start time
 * and Duration with regard to start of the pass.
 * The function begins by defining variables necessary for observations at qth based
 * upon JSpredict capabilities utilized later within its methodology; these include
 * the list TLELines composed by breaking the user provided string representation
 * consisting simply ONE \r\n between each line element pair , with a new line
 * representing Line elements . Next , we check whether current observed line elements
 * are null before we attempt  observe the next two adjacent lines which follow
 * suit(taking their place respectively at Index position : i+1) until another pass
 *   (subsequent line element) remains unobserved by being beyond minimum elevation
 * required or else maximum duration  allowed per predicted passage passes the upper
 * limit and continues loop iteration while either still remaining within the former
 * limits before concluding via array's size . Once having covered both successive
 * lines if we remain left with leftover array positions containing incomplete observed
 * information - typically from the starting two original entries given without their
 * adjacent pairs- whose durations haven’t yet exceeded maximum allowed values per
 * predicted pass (in milliseconds), the program simply adds that to total calculated
 * pass duration . Ultimately then returns all collected organized by Satellite names
 * 
 * Are there any requests you would like me to address or clarify for this function?
 * 
 * @param { string } TLE - TLE (Two Line Elements) is the input parameter that is
 * expected to be a spacecraft's ephemeris data organized as two line elements separated
 * by a newline character "\n", providing satellite position information at specified
 * times.
 * 
 * @param { object } qth - The `qth` input parameter specifies the observer location.
 * 
 * @returns { object } The output returned by the `getTransits()` function is an array
 * of passes with information about each satellite pass. Each pass includes satellite
 * details such as frequency and direction of movement. Additionally it also displays
 * the countdown timer until the pass starts; apex azimuth when satellite transits
 * through the horizon (indicating whether satellite is going West or East); start
 * time and end time for that particular pass with total duration.
 */
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

/**
 * @description Lists pass.
 * 
 * @param {  } qth - QUERY THAT PARAMETER THERE IS passes.
 * 
 * @returns { object } The output returned by this function is a promise of an array
 * of transits.
 */
function listPasses(qth) {
  return loadTLE().then((tle) => getTransits(tle, qth));
}

/**
 * @description determinePass returns a single transit event or "false" if there are
 * no events that pass the minimum elevation angle of the satellites on the ground
 * station's location qth and starts at startTime
 * 
 * @param { array } qth - Qth input parameters serves as a fixed observation point.
 * It consists of an array with two elements: latitute and longitude.
 * 
 * @param { number } startTime - The startTime parameter determines when each pass
 * ends and begins by telling the jspredict() which moment at which to begin observing
 * transits from the satellites over the QTH (Quality Tracking H Station). This
 * parameter sets the boundary for when an observational period will conclude for
 * each transit; passes will be filtered based on how much elevation the satellite
 * reached before being declared valid.
 * 
 * @returns { object } The function "determinePass" returns a list of passes or false
 * if no pass is found. The list contains objects with satellite name and maximum
 * elevation information. The object is ordered based on start time. If no pass is
 * found within the given start and end times (20 minutes), the function returns "false."
 */
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

/**
 * @description It accepts two parameters: pass and height and returns an array of
 * satellite positions at those locations over the course of 500 milliseconds.
 * 
 * @param { object } pass - The `pass` input parameter provides information about
 * which satellite and line(s) to process within the TLE files loaded via the `loadTLE()`
 * method.
 * 
 * @param { number } height - Height is a parameter that represents the number of
 * seconds to propagate. It determines how far into the future the satellite positions
 * are calculated. The function will iteratively add line durations up to the height
 * provided to obtain multiple positions along the satellite's trajectory over a
 * specific period.
 * 
 * @returns { array } The function "getSatellitePositions" returns an array of arrays
 * each containing two values (latitude and longitude). These are the predicted
 * positions of the satellite over time based on its TLE information and the location's
 * height from Earth's center to its surface. Each inner array represents one prediction
 * at a single moment based on its time.
 */
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
