# decentralised_chat_application

CS 553 Project Repo

Welcome to decentralised chat application

Team Members :-
Srikar Gona(gs943)
Nithish Komuravelli (nk793)

Install Node.js in the machine. After that,

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

**Implementation :-**

We used an ipfs file system to store the users data, where a unique peer id is created for
each user when we initialize the node in ipfs server.

All the necessary information is loaded into that which includes database details and the
list of friends for that user for which the directory is established. By using ipfs the user
has absolute control over his/her data as it is stored in a decentralized manner.

Then we use orbit db to maintain the database of the users and the associated data for each
of the users

<img width="365" alt="image" src="https://user-images.githubusercontent.com/39754987/236846629-620bb34b-912e-4bb7-b4d3-1de8fe3724d4.png">

The chat establishes when a user adds a friend to his directory and connects to the orbit
chat network and starts listening to the messages. End-to-end encryption is maintained
whenever the users send messages between them.

We used orbit chat api. Which helps a user to listen to a particular channel by providing
the channel name when another user sends messages.

Send message :- send() is an api provided by orbit chat which is used to send a
message to the channel. We used this api to send a message to that channel by
sending 2 parameters - channel name and message.

Leave channel :- leave() api is used to leave from an already connected channel. We
used this to disconnect from a channel when the user clicks on the disconnect button.

connect() :- this api is used to connect to a channel by using the channel name.

events.on() :- this api is used to listen to the messages continuously whenever the
database is updated. We used this api by providing the channel name and telling the
application to update the chat window whenever a new message is received in it.

create node() :- used to create a ipfs node
create root folder() :- whenever a new user is created a root folder is created for him
to store his details

connect to db() :- used to connect to orbit db which takes the parameters orbit
database and ipfs node

We are establishing the channel by appending the peer-id’s of both the users. Such that it
will be unique every time a channel is created.

After chatting with his friend, the user may disconnect from the channel by clicking on the
disconnect button. Then the established channel with orbit db is disconnected.

Encryption - As we are storing the data in decentralised manner in OrbitDB, we encrypted
the messages which we are storing. And while sending it to the other user, it decrypts and
renders back.

Multihash approach is used to encrypt the message into the orbit db

**User Flow:-** 

As an end user opens the application. It first asks the user name that would be used in the
chat.

After that, a peer ID is generated. Which in turn can be used by another user to connect to
this user, establish a channel, and chat with him.

**Process -**

Take the peer id of another friend, and in the Profile section, create a directory for him.
After creating the directory, one can see him in the friends list.
One can initiate the chat by clicking on the respective user in the friends list.


Then a new chat window opens, and both the users can start simultaneously sending
messages to each other

There is also an option where the users can disconnect from the chat and also from the
established channel by clicking on the disconnect button.

As the web page is loaded, an ipfs node is initialized for the user and a root folder in that node
is created.
