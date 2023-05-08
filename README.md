# decentralised_chat_application

CS 553 Project Repo

Welcome to decentralised chat application

Team Members :-
Srikar Gona(gs943)
Nithish Komuravelli (nk793)

**Project Setup Details -** 

Install **Node.js** in the machine.

By using this website - https://nodejs.org/en/download

In the "PATH" environment variable - add the folder where the nodejs is installed

**Ex -** C:\Program Files\nodejs

Check if Node is installed in the system by this command - **node -v**

and also if npm is installed by - **npm -v**

After that,

Run the following in the Project Root Folder

**npm install**

In windows change one paramater in package.json to

**"http-server": "0.9.0",** 

After that install 2 npm packages using 

**npm install http-server**                                                                   
**npm install watchify**

then start the server using the command

**npm start**

Then the application will run in the IP provided by npm start

Look into the outputs in the console for additional information while using the application

When the website opens, It asks for username, after entering that a unique peer-id is generated for that user. 
That can be used to create a directory with another friend by going to the Profile section. After creating that, he can chat with him by going to **Start a Chat** section, by clicking in the link of that user. Then a chat window opens which allows him to send messages. It also provides an option to disconnect from the chat.

The same procedure can be followed by his friend to connect to the chat and simultaneously send messages.

**Evaluation metrics -** 

We calculated Response time, Message load time for different type of messages which include large and mixed types. It is present in index.js file where we used performance.now() to measure it.

**Setup Time + Metrics Evaluation -** 1 hr 30 min.
