import argparse
import csv
import os 
import resend
import sys
import time
from dotenv import load_dotenv


path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(path)

resend.api_key = os.environ.get('REACT_APP_RESEND_API_KEY')

# Run "python outreach_email.py" with additional arguments as below
def main():
    # Use quotations when passing in string arguments. For example, python outreach_email.py --name "Nidhi Soma" is the argument WITH quotes. Additionally, the csv file argument should include whole filename, including .csv . For example, "data.csv" if current directory, or if in subdirectiory then "src/data.csv".
    parser = argparse.ArgumentParser()
    parser.add_argument("-n", "--name", default="Nidhi Soma", type=str, help='Enter your name to be used in email. Format: "<First Last>"')    
    parser.add_argument("-e", "--email", default="queuemein@cornelldti.org", type=str, help='Enter your email address. Format: "<email>"')
    parser.add_argument("-p", "--pm", default="vw77@cornell.edu", type=str, help='Enter the product manager email. Format: "<email>"')
    parser.add_argument("-t", "--tpm", default="ns848@cornell.edu", type=str, help='Enter the technical product manager email. Format: "<email>"')
    parser.add_argument("-f", "--filename", default="classes.csv", type=str, help='Enter the csv file name to be used. Format: "<filepath.csv>"')  
    
    args = parser.parse_args()
    
    name = args.name
    email = args.email
    pm = args.pm
    tpm = args.tpm
    filename = args.filename
    subject = ''
    content = ''
    # public link to new QMI Pitch video
    link = 'https://drive.google.com/file/d/1RiADVBZVUN4F-ma6D_YmOCyBPll3MNay/view'
    
    emails = [] 
    with open(filename, mode='r') as file:
        csvFile = csv.reader(file)
        header = next(csvFile)
        for lines in csvFile:
            print(lines)
            course = lines[0]
            profnames = lines[1]
            profemails = lines[2]
            used = lines[3]
            
            if profnames == '' or profemails == '' or course == '' or used == '':
                print('Professor name or email is empty')
                print('-'*50)
                continue
            
            #Handle multiple professor names
            final = profnames.strip()
            if ',' in profnames:
                profnames = [p.strip() for p in profnames.split(',')]
                final = profnames[0].strip().split(' ')
                final = final[len(final) - 1]
                for i in range(1, len(profnames)):
                    newProf = profnames[i].strip().split(' ')
                    final += ' and Professor ' + newProf[len(newProf) - 1]
            else:
                final = profnames.strip().split(' ')
                final = final[len(final) - 1]
            # Handle multiple professor emails
            if ',' in profemails:
                profemails = [entry.strip() for entry in profemails.split(',')]
            else:
                profemails = [profemails]
            # Handle multiple courses
            course_final = course
            if ',' in course:
                course_final = [c.strip() for c in course.split(',')]
                course_final = "/".join(course_final)
            
            # used value of 0 means only the course has used QMI. value of 1 means the professor has used QMI. value of 2 means both the professor and course used QMI.
            if used[0] != '-':
                content = f"Dear Professor {final},\nHello! My name is {name}, and I am the technical product manager of Queue Me In for this upcoming semester. In the past {course_final + ' has' if used.startswith('0') else 'you have'} been a frequent user of Queue Me In during previous semesters, and we're reaching out to see if you would like us to set up {course_final} on Queue Me In again this semester to manage and streamline office hours. If you have any questions about Queue Me In, we're happy to provide more information as well!\nLinked below is a pitch of QMI for more details about the product if you need it!\n\nThank you, and I look forward to hearing from you soon!\n\n{link}\n\nSincerely,\n\n{name}"
                subject = 'Will you be using Queue Me In again this semester?'
            # a value of -1 means neither the course or professor has used QMI before
            elif used.startswith('-1'):
                content = f"Dear Professor {final},\nHello! My name is {name}, and I am the technical product manager of Queue Me In for this upcoming semester. Queue Me In is built by Cornell DTI and is used by several IS/CS classes here at Cornell, including CS 1110, CS 2110, CS 3110, and CS 3410, to name a few. We were wondering if you would like us to set up a Queue Me In office hours course for {course_final} this semester to help manage and streamline office hours. If you have any questions about Queue Me In, we're happy to provide more information as well!\nLinked below is a pitch of our work so that you can review if this is something you’d like to use this semester.\n\nThank you, and I look forward to hearing from you soon!\n\n{link}\n\nSincerely,\n\n{name}"
                subject = 'Try using Cornell DTI’s Queue Me In to streamline office hours this semester!'
            else:
                print('Invalid value for used')
                sys.exit(1)
        
            print(f"Sending email to {profemails} from {email}...")
            print(f"Subject: {subject}")
            print(f"Content: \n{content}")

            params: resend.Emails.SendParams = {
                'from': email,
                'to': profemails,
                'subject': subject,
                'text': content,
                'cc': [pm, tpm]
            }

            email_id = resend.Emails.send(params)
            print(f"Email ID: {email_id}")
            emails.append((email_id, profemails))
            print('-'*50)         
            time.sleep(3)   
    
    with open('./emails.csv', mode='w') as file:
        writer = csv.writer(file)
        writer.writerow(['Email ID', 'Professor Emails'])
        for email in emails:
            writer.writerow(email)
                
if __name__ == "__main__":
    main()