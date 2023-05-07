'use strict'

const IPFS = require('ipfs');
const orbitDatabase = require('orbit-db');
const Orbit = require('orbit_');
const multiaddr = require('multiaddr')

const initialization = require('./initialization');
const utils = require('./utils');

document.addEventListener('DOMContentLoaded', async() => {
    
    const ipfsNode = await initialization.createNode(IPFS);

    console.log('IPFS node is initialized ipfsNode', ipfsNode);

    console.log("======= ipfs id", await ipfsNode.id());

    const isProfileNew = await initialization.createRootFolder(ipfsNode);

    const pathOfTheUser = '/root_folder/username.txt';

    console.log('pathOfTheUser is initialized');

    let loginEnteredByUser = "";

    let loginName = "";

    console.log("orbit Chat Connection initialized  00", + ipfsNode);

    await ipfsNode.files.read(pathOfTheUser).catch(async (err) => {

        loginEnteredByUser = prompt("Enter your username that would be used in chat", "Username");

        loginName = loginEnteredByUser;

        await ipfsNode.files.write(pathOfTheUser, Buffer.from(loginName), { create: true }).catch((err) => {});

    });

    console.log("orbit Chat Connection initialized  01", + ipfsNode);

    loginName = (await ipfsNode.files.read(pathOfTheUser)).toString('utf8');

    let friends_or_peers_list = await initialization.loadFriendsList(ipfsNode, isProfileNew);

    const databaseConnection = await initialization.connectToDB(ipfsNode, orbitDatabase);

    const orbitDBAddress = databaseConnection.address.toString()

    console.log('Successfully connected to orbit-DB at this database address: ' + orbitDBAddress);

    //add the ipfs node and username details to the database.

    console.log("orbit Chat Connection initialized  0", + ipfsNode);

    await initialization.addDetailsToDB(ipfsNode, databaseConnection, loginName);

    //initilaize the chat connection

    console.log("orbit Chat Connection initialized ipfsNode", + ipfsNode);

    console.log("orbit Chat Connection initialized Orbit", + Orbit);

    //const orbitChatConnection = "";

    console.log("before while");

    // while(!isNaN(ipfsNode)){

    console.log("inside while", ipfsNode);

    const orbitChatConnection = await initialization.connectToChat(ipfsNode, Orbit);

    console.log("after while", orbitChatConnection);

    console.log("======= ipfs id v2======", await orbitChatConnection._ipfs);

    const orbitDbVar = await orbitChatConnection.document;

    console.log('OrbitDB instance:', orbitDbVar);
    //console.log('Associated IPFS instance:', orbitDbVar._ipfs);

   // break;

    //}

    console.log("orbit Chat Connection initialized", + orbitChatConnection);

    //store the root hash in root hash value variable.
    
    const root_hash_value = await ipfsNode.files.stat('/root_folder');

    const root_folder_hash = root_hash_value.hash

    //get the ipfs node details

    const ipfsNodeDetails = await Promise.resolve(ipfsNode.id());

    //get the current user peer id using ipfs node details

    const current_user_peer_id = ipfsNodeDetails.id;

    const orbit_username = loginName;

    let medium = "";

    var chat_window_element = document.getElementById('Chat-Window');

    var element = chat_window_element;

    //log if successfully connected to orbit chat database

    orbitChatConnection.events.on('connected', () => {

        console.log('Successfully connected to orbit chat database');

    });

    orbitChatConnection.events.on('joined', async mediumName => {
            
        element.innerHTML += ">  Joined #" + mediumName + "<br>"

        console.log(`-!- Joined #${mediumName}`)
    });
    
    // Start listening for messages

    orbitChatConnection.events.on('entry', (entry,channelName) => {

        const post = entry.payload.value

        console.log(`[${post.meta.ts}] &lt;${post.meta.from.name}&gt; ${post.content}`)

        element.innerHTML += ("> " + `${post.meta.from.name}: ${post.content}` + "<br>")

    });
    
    // this function will be used to send message when the send button is clicked

    window.SendMessage = async function () {

        // Extract the contents of the submission

        var chat_message = document.getElementById("chat-message").value;
        
        // Ensure the fields weren't empty on submission

        if (!(chat_message)) {

            //alert when the entered message is empty.

            alert("Please enter a message!");

            return;
        }

        //send the message using orbit db.

        console.log("medium--", medium);

        const now = performance.now();

        console.log("Time===before===", now.toLocaleString());

        await orbitChatConnection.send(medium, chat_message);

        const now1 = performance.now();

        console.log("Time===after===", now1.toLocaleString());

        //console.log("=========================orbit chat conn address", orbitChatConnection.address);

        return false;
    };

    //disconnect from chat after clicking the disconnect button

    document.getElementById("disconnect-btn").onclick = async() => {

        try {

            //leave and disconnect from the connection

            await orbitChatConnection.leave();

            await orbitChatConnection.disconnect();

            //connect back to the user orbit chat connection

            await orbitChatConnection.connect(orbit_username).catch(e => console.error(e));

            alert ("Disconnected from the chat");

            //redirect to the chat window

            display("Chat");

        }
        catch(err) {

            alert (err);
        }
    };

    //connect back to the orbit database

    orbitChatConnection.connect(orbit_username).catch(e => console.error(e));

    //set the peer id of the user.

    document.getElementById('peer-id').innerText = current_user_peer_id;

    //maybe remove this afterwards??
    
    async function add_data_to_public_profile() {

        // Extract the contents of the submission

        const filename = document.getElementById('profile-filename').value

        const info = document.getElementById('profile-info').value

        // Ensure the fields weren't empty on submission

        if (!(info) || !(filename)) {

            alert("Please enter all fields before submitting.");

            return;
            
        }
    
        // Save the data to public profile
        let alert_data = await utils.addDataToPublicProfile(ipfsNode, databaseConnection, filename, info);
        alert (alert_data);

    }

    //create a friend directory to chat with him afterwards.

    async function create_friend_directory() {

        // get the friend peer id

        var peerIDOfFriend = document.getElementById("create-friend-directory-peer-id").value;

        if (!(peerIDOfFriend)) {

            alert("Please enter a valid peerID.");

            return;
        }

        //get the friend address

        let address_of_peer = '/p2p-circuit/ipfs/' + peerIDOfFriend;

        // connect with him using bootstrap

        await ipfsNode.bootstrap.add(address_of_peer)

        console.log('Added friend to bootstrap list!');

        console.log("ipfs node--", ipfsNode)

        try {

            await ipfsNode.swarm.connect(address_of_peer);

        }

        catch (err) {

        }

        //create directory for him by using the function provided in utils

        const success = await utils.createFriendDirectory(ipfsNode, databaseConnection, peerIDOfFriend);

        if(success) {

            let new_friend = '/p2p-circuit/ipfs/' + peerIDOfFriend;

            friends_or_peers_list.push(new_friend);

            const friendsListPath = '/root_folder/friends_list.txt';

            let flag = false;

            await (ipfsNode.files.read(friendsListPath)).catch((err) => {

                console.log('Creating friends list file...');

                flag = true;

            });

            if (flag) {

                await ipfsNode.files.write(friendsListPath, "", { create: true }); 

            }

            let ipfsString = (await ipfsNode.files.read(friendsListPath)).toString('utf8');

            ipfsString = ipfsString + '/p2p-circuit/ipfs/' + peerIDOfFriend + '\n';

            //using ipfs add the friend to the friends_list

            await ipfsNode.files.rm('/root_folder/friends_list.txt');

            await ipfsNode.files.write('/root_folder/friends_list.txt', Buffer.from(ipfsString), { create: true });

            //Finally update the db with the friend list

            await utils.updateDB(ipfsNode, databaseConnection);

            //give alert to the user that the friend directory is created.

            alert("Directory for peer " + peerIDOfFriend + " created!");
        }

        else {

            //alert if we couldn't create a directory for peer

            alert("An error occured. Could not create directory for peer" + peerIDOfFriend);

        }

    }

    async function open_chat(passage_name) {

        // Extract the passage name

        medium = passage_name;

        // console.log (passage_name);
        
        // Validate the fields before submission

        if (!(medium)) {

            alert("Please enter all valid values")

            return;
        }

        // Connect to the channel and open the chat window

        console.log("orbit chat connextion --", orbitChatConnection)

        console.log("orbit chat medium --", medium)

        // orbitChatConnection.on(medium, (message) => {
        //     // Handle the incoming message here
        //     console.log(`Received a message from ${message.sender}: ${message.content}`);
        // });

        const now = performance.now();

        console.log("Time===before=22==", now.toLocaleString());

        await orbitChatConnection.join(medium);

        const now1 = performance.now();

        console.log("Time===after=22==", now1.toLocaleString());

        //re-direct to the chat window

        display("Chat-Body");


    }

    function display(displayID) {

        //hide all the other displays and display only the block for which the id is provided.

        document.getElementById('Home').style.display = 'none';

        document.getElementById('Profile').style.display = 'none';

        document.getElementById('Chat').style.display = 'none';

        document.getElementById('Chat-Body').style.display = 'none';

        //set the display to block

        document.getElementById(displayID).style.display = 'block';
    }

    // Display the Home Page

    document.getElementById("home-btn").onclick = () => {

        display("Home");

    }

    // Display the Profile Page

    document.getElementById("profile-btn").onclick = async () => {
        
        display("Profile");
    }

    //display the friends who are online and offline

    async function display_online_offline_friends () {
        
        const stream_peers = await ipfsNode.swarm.peers();

        let friends_who_are_offline = "";

        let friends_who_are_online = "";

        for (const address_of_friend of friends_or_peers_list) {

            let is_connected_flag = 0;

            let friend_login_name = "";

            try {

                let friend_user_name = address_of_friend.split('/')[3];

                let database_test_connection = await databaseConnection.get(friend_user_name);

                friend_login_name = database_test_connection['0']['username'];
            }
            catch (err) {

                // If there is an exception, assign the friend login name by that address.

                friend_login_name = address_of_friend;

            }

            for (const stream_peer of stream_peers) {
                
                if (stream_peer['addr']['buffer'].toString() == address_of_friend) {

                    friends_who_are_online = friends_who_are_online.concat('<a href=\"\" onclick=\"return OpenChat(\'' + address_of_friend + '\');\">', friend_login_name, "</a><br>");
                    
                    is_connected_flag = 1;

                    break;
                }

            }

            //If it is not connected, then those peers are offline.

            if (is_connected_flag == 0) {

                friends_who_are_offline = friends_who_are_offline.concat('<a href=\"\" onclick=\"return OpenChat(\'' + address_of_friend + '\');\">', friend_login_name, "</a><br>");
            
            }
        }

        // Display list of online and offline friends

        // By displaying that particular html ID

        document.getElementById('offline_friends').innerHTML = friends_who_are_offline;

        document.getElementById('online_friends').innerHTML = friends_who_are_online;

    }

    //display the chat window

    document.getElementById("start-a-chat-btn").onclick = () => {
        
        display_online_offline_friends ();

        display("Chat");

    }

    //todo : open chat channel by entering the channel

    function open_chat_prep()
    {
        var channel_name = document.getElementById("chat-channel").value;
        
        open_chat(channel_name);
    }

    document.getElementById("create-friend-directory-btn").onclick = create_friend_directory;

    window.OpenChat = function(multiaddr) {

        let friends_peer_id = multiaddr.split('/')[3];

        //creating the channel id by appending both peer id's in lexicographical order.

        if (current_user_peer_id < friends_peer_id)

            open_chat (current_user_peer_id + '' + friends_peer_id);

        else

            open_chat (friends_peer_id + '' + current_user_peer_id);

        return false;
    };

    document.getElementById("page").style.display = "block";

    document.getElementById("loading").style.display = "none";

})