# therata2eproject

Pepper is a cooking assistance service that showcases a Voice based navigation through a Recipe.

Features include:
Ability to capture user's preferences for Diet, Cuisine, Complexity of recipes,  Ways to interact with the voice solution, Infotainment and Notification timing.

## Platform offers:

### Planning capabitlity:
Plan cooking recipes over a period of time – assign recipes to a day/time
Aggregate and generate easy to use grocery lists with ingredients required to cover day(s) of cooking
Add and delete ingredients based on availability in pantry
Ability to order list at Amazon Green or Instacarts etc.

### Cooking assistance:
Provide voice based assistance to any and/or multiple recipes  by normalizing any recipe on the internet

Provide detailed glossary (audio visual) of technical terms 

Break prep and cooking steps into logical buckets where relevant

Provide standardized scales for 
Cooking complexity
Utensils/Tools needed

Standardize outputs of voice conversation on to the app/chatbot to give user a visual option too


## Architecture
The code included here is of the following three subsystems that interface with each other via respective APIs to the backend server.

### iOS App
User app to select recepies on the internet and submit as one the favorites. The server converts any recepie from the Internet and converts it into voice enabled format appropriate for the Alexa Skill to navigate through when the user invokes in the kitchen

### Alexa Skill
Voice enabled interface to the receipe sleected for cooking. The Skill assists the user with food preparation by walking through the ingredients and pre-preparatiojn steps. Then it helps the user in a human voice, as if guided by a chef expert, while the user goes through the cooking steps, including appropriate wait times and reminders.
https://github.com/adnanwarsi/therata2eproject/blob/master/Red%20Pepper%20-%20Converstation%20Flow%20Diagram.pdf

### Backend Server 
A detailed AWS Lambda server in Python that provides the backend functionality for the Alexa Skill and iOS app for the Pepper 
