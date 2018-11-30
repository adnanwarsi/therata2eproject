# therata2eproject

Pepper is a cooking assistance service that showcases a Voice based navigation through a Recipe.

https://github.com/adnanwarsi/therata2eproject/blob/master/Pepper%20product.pdf

Features include:
Ability to capture user's preferences for Diet, Cuisine, Complexity of recipes,  Ways to interact with the voice solution, Infotainment and Notification timing.

## Architecture
The code included here is of the following three subsystems that interface with each other via respective APIs to the backend server.

### iOS App
User app to select recepies on the internet and submit as one the favorites. The server converts any recepie from the Internet and converts it into voice enabled format appropriate for the Alexa Skill to navigate through when the user invokes in the kitchen

### Alexa Skill
Voice enabled interface to the receipe sleected for cooking. The Skill assists the user with food preparation by walking through the ingredients and pre-preparatiojn steps. Then it helps the user in a human voice, as if guided by a chef expert, while the user goes through the cooking steps, including appropriate wait times and reminders.
https://github.com/adnanwarsi/therata2eproject/blob/master/Red%20Pepper%20-%20Converstation%20Flow%20Diagram.pdf

### Backend Server 
A detailed AWS Lambda server in Python that provides the backend functionality for the Alexa Skill and iOS app for the Pepper 
