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

# Classes to blacklist because professors are not interested in using QMI
blacklist = [
   'INFO 3152',
   'CS 3152',
   'INFO 4400',
   'INFO 4390'
   'INFO 4152',
   'CS 4152'
]

def getCourseStatus(course, professors):
    """
    Returns the status of the course/professors in the past semester on whether they have used QMI before

    2 indicates that both the course and professor have used QMI before
    1 indicates that professor used QMI before
    0 indicates that course used QMI before
    -1 indicates that neither the course nor the professor have used QMI before

    :param course: The course subject and its code (e.g CS 1110)
    :param professors: The string that consist of all the professors teaching the course this sem (e.g "Michael Clarkson, Lillian Lee" )
    """
    with open('../scripts/trackers/past_semester.csv', 'r') as file:
        csvreader = csv.reader(file)
        header = next(csvreader)
        
        for row in csvreader:
            if row[0] == course:
                # List of professors in the current semester
                current_professors = professors.split(", ")

                # List of professors in the past semester
                past_professors = row[1].split(", ")

                # Checks if at least one professor in the current semester is in the past professors
                if any(p in past_professors for p in current_professors) or professors in past_professors:
                    # If the course previously decided to use QMI and the professor is in the past professors, return 2 (both course/prof used QMI)
                    if row[4] == "yes":
                        return 2

                    # If the course previously decided not to use QMI and the professor is in the past professors, return the status from the past semester
                    return row[3]
                
                # If the professor is not in the past professors
                else:
                    # If the course previously decided to use QMI, return 0 (course used QMI)
                    if row[4] == "yes":
                        return 0
                    # If the course previously decided not to use QMI, but the course and professor has used QMI before, return 0 (course used QMI)
                    elif row[4] == "no" and row[3] in ["2", "0"]:
                        return 0
                    return -1
    # If no match is found, return -1 after checking all rows
    return -1

classesJSON = []
for s in subjects:
  if s['value'] in relevent_courses:
    classURL = "https://classes.cornell.edu/api/2.0/search/classes.json?roster="+roster+"&subject=" + s['value']
    classesJSON.extend(grab_json(classURL)['data']['classes'])

def getProfessorInfo(instructors):
  """
  Returns the names and emails of the professors teaching the course

  :param instructors: The list of instructors teaching the course
  """
  accum_names = "" # To accumulate all the professor names
  accum_emails = "" # To accumulate all the professor emails
  for professor in instructors:
    name = professor['firstName'] + " " + professor['lastName'] + ", "
    email = professor['netid']  + '@cornell.edu' + ", "
    accum_names += name 
    accum_emails += email
  # Remove preceding and trailing , and "
  return accum_names.strip(', ').strip('\"'), accum_emails.strip(', ').strip('\"')

# Some courses are not relevant 
# We will filter out these courses if they contain these words
irrelevant_courses = ["Independent", "Research", "Project", "Projects", "Academic Support", "Sem", "Seminar", "Supplement", "Honors", "Thesis"]

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

  course = c['subject'] + " " + c['catalogNbr']

  # Course must not be blacklisted
  isNotBlacklisted = course not in blacklist
  item = {
    'Course': course,
    'Professor': names,
    'Emails': emails,
    'Has course/professor use QMI before': getCourseStatus(course, names)
  }
  if hasProfessor and isUndergrad and isNonResearch and isCredit and isOnCampus and isNotBlacklisted:
    classes.append(item)

# Dictionary to store professor and the courses they teach
professor_courses = {}

# Populate the dictionary
for item in classes:
    course = item['Course']
    professor = item['Professor']
    email = item['Emails']
    status = item['Has course/professor use QMI before']
    key = (professor, email, status)
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
    for (professor_name, professor_email, status), course_list in professors_with_multiple_courses.items():
        # Remove the individual courses from the classes list that have the same professor
        for item in classes:
            if item['Course'] in course_list:
              classes.remove(item)
        class_list = list(course_list)  # Convert set to list
        # Append the combined version of the courses
        classes.append({
          'Course': ', '.join(course_list),
          'Professor': professor_name,
          'Emails': professor_email,
          'Has course/professor use QMI before': status
        })
else:
    print("No professors teach multiple courses.")

with open('../scripts/classes.csv', 'w') as file:
    field = ["Course", "Professor", "Emails", 'Has course/professor use QMI before']
    writer = csv.DictWriter(file, fieldnames=field)

    # Write header
    writer.writeheader()
    
    # Write rows to the CSV
    writer.writerows(classes)