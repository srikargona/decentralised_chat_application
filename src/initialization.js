
async function add_details_to_database(input_node, database, login_name) {

    const id_now = input_node.id();

    const input_node_id = id_now

    const nodeDetails = await Promise.resolve(input_node_id)

    const myPeerId = nodeDetails.id

    const root = await input_node.files.stat('/root_folder');

    //put details in the database.

    await database.put({ '_id': myPeerId, public_key: 'test', root_hash: root.hash, multiaddr: '/p2p-circuit/ipfs/' + myPeerId, username: login_name })
}

async function connect_to_database(input_node, OrbitDatabase) {

    // Create OrbitDB instance

    const orbitdb = await OrbitDatabase.createInstance(input_node);

    const options = {

        // Give write access to everyone

        accessController: {
            write: ['*'],
        },

        // indexBy: 'peerID',

        pin: true
    };

    // Create / Open a database
    const db = await orbitdb.docs("users_database4", options);

    // Load locally persisted data
    await db.load();

    return db;
}

async function loadFriendsListFromDirectories(ipfs_node_1, isProfileNewlyCreated) {

    const pathOfTheFriendsList = '/root_folder/friends_list.txt';

    let alert_flag = false;

    await (ipfs_node_1.files.read(pathOfTheFriendsList)).catch((err) => {

        console.log('Creating friends list file...');

        alert_flag = true;

    });

    if (alert_flag) {

        await ipfs_node_1.files.write('/root_folder/friends_list.txt', Buffer.from(''), { create: true })

        console.log('Created friends list file');

    }

    let string_path = (await ipfs_node_1.files.read(pathOfTheFriendsList)).toString('utf8')

    console.log(string_path)

    let friend_list = string_path.split("\n");
    
    return friend_list.slice(0, -1);

}

async function root_folder_initialization_for_ipfs(root_node) {

    let isRootFolderCreated = false;

    isRootFolderCreated = await root_node.files.mkdir('/root_folder').catch((err) => {

        //return true if Root folder already exists

        console.log('Root folder already exists!')

        return true;

    });

    if(isRootFolderCreated)
        return false;

    await root_node.files.mkdir('/root_folder/public_profile');

    await root_node.add({ path: '/root_folder/friends_list.txt', content: '' });

    return true;
}

async function ipfsNodeCreation(IPFS) {

    //create the node from ipfs repository.

    const ipfsNode = await IPFS.create({ repo: 'ipfs_repository' });

    return ipfsNode;

}

// Create a new Orbit-DB database
async function createDB(ipfsNode, OrbitDB) {

    // TODO: error handling

    const orbit_database = await OrbitDB.createInstance(ipfsNode);

    const database_options = {

        // Give write access to everyone

        accessController: {

            write: ['*'],
        },

        pin: true

    };

    const final_database = await orbit_database.docs('users_db9', database_options);

    return final_database;
}

async function connectToChatChannel(node, Orbit) {

    //create a new orbit chat by new keyword.

    const orbit_chat = new Orbit(node);

    return orbit_chat;

}


module.exports.createNode = ipfsNodeCreation;

module.exports.createRootFolder = root_folder_initialization_for_ipfs;

module.exports.addDetailsToDB = add_details_to_database;

module.exports.connectToDB = connect_to_database;

module.exports.createDB = createDB;

module.exports.connectToChat = connectToChatChannel;

module.exports.loadFriendsList = loadFriendsListFromDirectories;