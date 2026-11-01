#!/usr/bin/env python3
"""Validate a local export against HL7's R4 JSON schema; no patient data is uploaded.
Requires Python jsonschema. Terminology and profile validation require the HL7 validator.
"""
import argparse, io, json, urllib.request, zipfile
import jsonschema
parser=argparse.ArgumentParser()
parser.add_argument('bundle')
parser.add_argument('--schema',help='Optional offline path to official fhir.schema.json')
args=parser.parse_args()
if args.schema:
 with open(args.schema) as stream: schema=json.load(stream)
else:
 raw=urllib.request.urlopen('https://hl7.org/fhir/R4/fhir.schema.json.zip',timeout=30).read()
 with zipfile.ZipFile(io.BytesIO(raw)) as archive: schema=json.loads(archive.read('fhir.schema.json'))
with open(args.bundle) as stream: bundle=json.load(stream)
errors=list(jsonschema.Draft6Validator(schema).iter_errors(bundle))
for error in errors:
 # Print locations only; validator messages can contain patient values.
 print('Schema error at: '+('/'.join(map(str,error.path)) or '/'))
print(f'FHIR R4 JSON schema: {len(errors)} error(s).')
raise SystemExit(bool(errors))
