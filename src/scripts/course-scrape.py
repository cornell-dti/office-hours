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
  'CHEME',
  'ECE',
  'AEP',
  'BIO',
  'BIOMG',
  'MATH',
  'STSCI'
]

classesJSON = []
for s in subjects:
  if s['value'] in relevent_courses:
    classURL = "https://classes.cornell.edu/api/2.0/search/classes.json?roster="+roster+"&subject=" + s['value']
    classesJSON.extend(grab_json(classURL)['data']['classes'])

def getProfessorInfo(instructors):
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


# Some courses are not relevant 
# We will filter out these courses if they contain these words
irrelevant_courses = ["Independent", "Research", "Project", "Projects", "Academic Support", "Sem", "Seminar"]

classes = []
for c in classesJSON:
  instructors = c['enrollGroups'][0]['classSections'][0]['meetings'][0]['instructors']
  names, emails = getProfessorInfo(instructors)
  hasProfessor = names != ""
  isUndergrad = int(c['catalogNbr']) < 5000
  isNonResearch = all(word not in c['titleShort'] for word in irrelevant_courses)
  # At least 3 credits
  isCredit = c['enrollGroups'][0]['unitsMinimum'] > 2
  # Course must be on campus and not Cornell Tech
  isOnCampus = c['enrollGroups'][0]['classSections'][0]['locationDescr'] == "Ithaca, NY (Main Campus)"
  item = {
    'Course': c['subject'] + " " + c['catalogNbr'],
    'Professor': names,
    'Emails': emails
  }
  if hasProfessor and isUndergrad and isNonResearch and isCredit and isOnCampus:
    classes.append(item)

# Dictionary to store professor and the courses they teach
professor_courses = {}

# Populate the dictionary
for item in classes:
    course = item['Course']
    professor = item['Professor']
    email = item['Emails']
    key = (professor, email)
    if key in professor_courses:
        # Adds the course to the set of courses the professor teaches
        professor_courses[key].add(course)
    else:
        professor_courses[key] = {course}

professors_with_multiple_courses = {}

# Find professors teaching multiple courses
for professor, course_list in professor_courses.items():
    if len(course_list) > 1:
        professors_with_multiple_courses[professor] = course_list

# Output results
if professors_with_multiple_courses:
    print("Professors teaching multiple courses:")
    for (professor_name, professor_email), course_list in professors_with_multiple_courses.items():
        print(f"{professor_name} ({professor_email}) teaches: {', '.join(course_list)}")
        # Remove the individual courses from the classes list that have the same professor
        for item in classes:
            if item['Course'] in course_list:
              classes.remove(item)
        # Apoend the combined version of the courses
        classes.append({
          'Course': ', '.join(course_list),
          'Professor': professor_name,
          'Emails': professor_email
        })
else:
    print("No professors teach multiple courses.")

with open('../classes.csv', 'w') as file:
    field = ["Course", "Professor", "Emails"]
    writer = csv.DictWriter(file, fieldnames=field)

    # Write header
    writer.writeheader()
    
    # Write rows to the CSV
    writer.writerows(classes)