
async function search_directory_of_peers(node_id, database, friend_peer_id, address_m) {

    let peer_address = '/p2p-circuit/ipfs/' + friend_peer_id;

    const bootstrap_list = await node_id.bootstrap.list()

    let length_of_peers = bootstrap_list["Peers"].length

    for (let i = 0; i < length_of_peers; i++) {

        let peer_to_peer_address = bootstrap_list["Peers"][i];

        if (peer_to_peer_address == peer_address) {

            return "This peer is already in your friends list";

        }
    }

    const node_id_id = node_id.id();

    const node_id_details = await Promise.resolve(node_id_id);

    const my_current_peer_id = node_id_details.id;

    const friend__profile = await database.get(friend_peer_id)

    if (!(friend__profile && friend__profile.length)) 
        return 'friend details are not present in orbit DB, couldnt find them';
    

    const address_of_friend = friend__profile['0']['multiaddr'];

    await node_id.bootstrap.add(address_of_friend);

    console.log ("Added friend to bootstrap list!");

    await node_id.swarm.connect(address_of_friend);

    const root_hash = friend__profile['0']['root_hash']

    const helloMessagePath = '/ipfs/' + root_hash + '/' + my_current_peer_id + '/hello.txt';

    console.log ("Added friend to bootstrap list!");

    let alert_flag = false;

    let alert_message = "";

    const temp = await node_id.files.read(helloMessagePath)
        .catch((err) => {

            alert_message = 'Either\n1. The peer node isn\'t present\n';

            alert_message += '2. Peer node is present but you are not in connection with them\n';

            alert_message += '3. Peer node didnt set up the root folder in ipfs\n';

            alert_message += '4. The peer node has not created the directory for you\n\n';

            alert_message += 'Couldnt add this peer id as your friend';

            alert_flag = true;

        });
    
    if (alert_flag) {

        try {

            await node_id.bootstrap.rm (address_of_friend);

            console.log ("Removed friend from bootstrap list!");

            console.log ("Added friend to bootstrap list!");

        }
        catch (err) {

        }
        
        return alert_message;
    }

    const restrictedMessage = temp.toString('utf8');

    console.log(restrictedMessage);

    friend_multiaddr_list.push(address_of_friend);

    const pathOfFriendsList = '/root_folder/friends_list.txt';

    alert_flag = false;

    await (node_id.files.read(pathOfFriendsList)).catch((err) => {

        //console.log('Creating friends list file...');

        alert_flag = true;

    });

    if (alert_flag) {

        await node_id.files.write(pathOfFriendsList, "", { create: true });

    }

    let pathStringFile = (await node_id.files.read(pathOfFriendsList)).toString('utf8');

    //Store the path string file.

    pathStringFile = pathStringFile + '' + address_of_friend + '\n';

    await node_id.files.rm('/root_folder/friends_list.txt');

    await node_id.files.write('/root_folder/friends_list.txt', Buffer.from(pathStringFile), { create: true });
    
    //Update the database
    
    await database_updation(node_id, database);

    return "Friend added successfully!";
}

async function database_updation(node, database) {

    const node_id = node.id()
    
    const nodeDetails = await Promise.resolve(node_id);

    const current_user_peer_id = nodeDetails.id;

    const new_root_hash = await node.files.stat('/root_folder');

    let databaseRecord = await database.get(current_user_peer_id);

    databaseRecord[0].root_hash = new_root_hash.hash;

    console.log('New root folder hash is: ' + new_root_hash.hash);

    // Update the Database.
    database.put(databaseRecord[0])
    .then(() => database.get(current_user_peer_id))
    .then((value) => {
        console.log('The Database has been updated with the new root folder hash provided');
    });

}

async function directory_creation_for_peer(node_id, database, friend_peerID) {

    let data_to_be_alerted = "";

    const profileData = await database.get(friend_peerID)

    if (!(profileData && profileData.length)) 
    {   
        data_to_be_alerted = 'Could not find friend details, enter valid peer id';

        return data_to_be_alerted;
    }
    
    const address_of_friend = profileData['0']['multiaddr']

    await node_id.bootstrap.add(address_of_friend)

    console.log('Added friend to bootstrap list!');
    
    const friendDirectory = '/root_folder/' + friend_peerID;

    let alert_flag = false;

    await node_id.files.mkdir(friendDirectory).catch((err) => {

        console.log("Directory for this friend already exists");

        alert_flag = true;

    });

    const hello_message = friend_peerID;
    
    const final_message = hello_message;

    const file_path = '/root_folder/' + friend_peerID + '/hello.txt';

    alert_flag = false;

    await node_id.files.write(file_path, Buffer.from(final_message), { create: true }).catch((err) => {

        data_to_be_alerted = 'Unable to write hello message to file! Cannot add friend.\nError: ';

        data_to_be_alerted += err;

        alert_flag = true;

    });

    if (alert_flag) return data_to_be_alerted;

    const friendsListPath = '/root_folder/friends_list.txt';

    alert_flag = false;

    await (node_id.files.read(friendsListPath)).catch((err) => {

        console.log('Creating friends list file...');

        alert_flag = true;

    });

    if (alert_flag) {

        await node_id.files.write(friendsListPath, "", { create: true }); 

    }

    let string_path = (await node_id.files.read(friendsListPath)).toString('utf8');

    string_path = string_path + '/p2p-circuit/ipfs/' + friend_peerID + '\n';

    await node_id.files.rm('/root_folder/friends_list.txt');

    await node_id.files.write('/root_folder/friends_list.txt', Buffer.from(string_path), { create: true });

    data_to_be_alerted = 'Successfully updated friends list file!';

    await database_updation(node_id, database);
    
    return data_to_be_alerted;
}

async function add_data_to_public(node, database, filename, data_present_in_file) {

    let error_data = "";

    let alert_flag = false;

    await node.files.write('/root_folder/public_profile/' + filename, Buffer.from(data_present_in_file), { create: true }).catch((err) => {
        
        error_data = 'Could not create file in public profile! Error: ' + err;
        alert_flag = true;

    });

    if (alert_flag) return error_data;

    error_data = 'Added file \"' + filename + '\" to your public profile successfully!';

    await database_updation(node, database);

    return error_data;

}


module.exports.updateDB = database_updation;

module.exports.addDataToPublicProfile = add_data_to_public;

module.exports.createFriendDirectory = directory_creation_for_peer;

module.exports.searchPeerDirectory = search_directory_of_peers;