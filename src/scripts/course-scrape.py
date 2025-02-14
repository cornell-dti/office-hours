import requests
import csv
import json

def grab_json(url):
  return json.loads(requests.get(url).text)

rosterURL = "https://classes.cornell.edu/api/2.0/config/rosters.json"
rosters = grab_json(rosterURL)['data']['rosters']
# Get the most recent semester from the json
# Note that slug is sem/year (e.g SP25)
roster = rosters[-1]['slug']
# If the most recent semester is a WINTER or SUMMER sem, use the sem before it
if "WI" in roster or "SU" in roster:
  roster = rosters[-2]['slug']

# Get all subjects for that semester 
subjectsURL = "https://classes.cornell.edu/api/2.0/config/subjects.json?roster="+roster
subjects = grab_json(subjectsURL)['data']['subjects']

relevent_courses = [
  'CS',
  'BTRY',
  'INFO',
  'ORIE',
  'ECON',
  'PHYS',
  'CHEM',
  'ECE',
  'AEP',
  'BIO',
  'MATH',
  'STSCI'
]

classesJSON = []
for s in subjects:
  if s['value'] in relevent_courses:
    classURL = "https://classes.cornell.edu/api/2.0/search/classes.json?roster="+roster+"&subject=" + s['value']
    classesJSON.extend(grab_json(classURL)['data']['classes'])

def getProfessorName(instructors):
  accum_names = "" # To accumulate all the professor names
  accum_emails = "" # To accumulate all the professor emails
  for professor in instructors:
     # Handle middle name if exists
    middleName = professor['middleName'] + " " if professor['middleName'] else ""
    name = professor['firstName'] + " " + middleName + professor['lastName'] + ", "
    email = professor['netid']  + '@cornell.edu' + ", "
    accum_names += name 
    accum_emails += email
  # Remove preceding and trailing , and "
  return accum_names.strip(', ').strip('\"'), accum_emails.strip(', ').strip('\"')

classes = []
for c in classesJSON:
  instructors = c['enrollGroups'][0]['classSections'][0]['meetings'][0]['instructors']
  names, emails = getProfessorName(instructors)
  hasProfessor = names != ""
  isUndergrad = int(c['catalogNbr']) < 5000
  item = {
    'Course': c['subject'] + " " + c['catalogNbr'],
    'Professor': names,
    'Emails': emails
  }
  classes.append(item) if hasProfessor and isUndergrad else None

with open('../classes.csv', 'w') as file:
    field = ["Course", "Professor", "Emails"]
    writer = csv.DictWriter(file, fieldnames=field)

    # Write header
    writer.writeheader()
    
    # Write rows to the CSV
    writer.writerows(classes)