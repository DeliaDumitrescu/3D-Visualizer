# Tree-D-Visualizer

# Demo
[demo](https://www.youtube.com/watch?v=5BOdJ_90GMg)

# Are you a 3D artist who wants to promote his art in front of potential clients? 

Then, we have the right solution! Introducing Tree D Visualizer, the model visualizer of the FUTURE! 
* Upload models
* Have models organized on your wall page
* Look for inspiration from other artists.

# Wait, wait, wait, how is this different from other platforms? It seems to be the same thing...

Have you ever visited a website for 3D Models? They are all the same, pages full of nonesense that distract you from the real deal, THE MODELS. We're in 2021, people, everything is minimalistic, and people don't care about your useless ads.

So what did we do?
 
Got rid of all the nonsense! Now there is only quality content that people want to see.

# Cool, so how do I use your platform?

Easy, just browse the main page to see what other made if you're just regular user. 

If you are an artist, go ahead and make an account, then upload your models. It's as simple as that!

# User stories

* As a 3D artist I want a place where I can upload my 3D models so people can appreciate my work. 
* As a mother I want a platform with colorful 3D objects so I can use them to teach my child about various things. 
* As a freelance artist I want a platform where I can upload my creations so clients can see my portfolio. 
* As a dad I want a website full of 3D models so I can 3D print them for my child. 
* As an indie game developer I want a platform where I can find 3D artists so I can hire them to work with me. 
* As a graphics programmer I want to find an easy-to-use platform for 3D objects so I can download the models and use them to debug my code. 
* As an animator I want to find 3D objects so I can try experimenting with various animations on them. 
* As a student I want a place where I can upload my 3D objects so I can share them with my colleagues. 
* As a gamer I want a website where I can see my favorite videogame characters so I can admire them. 
* As a teacher I want to find 3D models so I can show them to my students when I'm teaching about certain objects. 

# Backlog creation

While making this project we used a backlog where we added tickets and assigned them to the members of the team. 
You can find the backlog [here](https://github.com/DeliaDumitrescu/3D-Visualizer/projects/1).

# UML Diagram

To make things easier, we used an UML Diagram to visualize the flow of the application. This helped us a lot in understanding how our code should be organized.

![app flow](https://github.com/DeliaDumitrescu/3D-Visualizer/blob/master/UML/flow.jpg)

# Source control

For source control we used the versioning system Git, and we pushed the commits onto this repository.

For each feature we created a different branch and then we created Pull Requests to merge them into master. 

At the time of writing this, we have 67 commits (more than 10).

# Unit tests

1.
```javascript
function findUserTest(){
    findUser(TEST_USERNAME, (err: any, row: any)=>{
        if (err){
            console.error("Test failed: finding user in database!");
        } else {
            if (row.username == TEST_USERNAME){
                console.log("Test passed : user was found!");
            } else {
                console.error("Test failed: trying to find user yielded other user!");
            }
        }
    });
}
```

2.
```javascript
function getUsersBySubstringTest(){
    getUsersWithSubstring(TEST_USER_SEARCH, (rows : any) => {
        let found = false;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].username == TEST_USERNAME){
                found = true;
                break;
            }
        }

        if (found){
            console.log("Test passed : finding user by substring!");
        } else {
            console.error("Test failed : finding user by substring not working!");
        }
    })
}
```

3.
```javascript
export function addModelTest(){
    fs.copyFile("./public/pasta-test.glb", "./public/pasta-test-2.glb", () => {
        moveFileFromTempDir("./public/pasta-test-2.glb", "pasta-test.glb", TEST_USERNAME, null, () => {
            if (fs.existsSync("./public/data/testUser/pasta-test.glb")){
                console.log("Test passed : adding a model to a user profile!");
                deleteModelTest();
            } else {
                console.error("Test failed : adding a model to a user profile not working!");
            }
        });
    });
}
```

4.
```javascript
export function deleteModelTest(){
    try {
        fs.unlinkSync("./public/data/testUser/pasta-test.glb");
        console.log("Test passed : deleting user model!");
    } catch(err) {
        console.error(err);
        console.error("Test failed : deleting user model!");
    }
}
```

5.
```javascript
function runAddUserTest(){
    insertUser(TEST_USERNAME,"test.user@email.com", "079292922", "Splaiul Unirii", "Bz1234%^", "M", (err : any) =>{
        if (err){
            console.error("Test failed: adding test user to database!");
        } else {
            console.log("Test passed : test user added to database!");

            findUserTest();
            getUsersBySubstringTest();

            addModelTest();

            deleteUser(TEST_USERNAME);
        }
    })
}
```

# Bug reporting

During development we encountered sever bugs. We added Issues for the bugs we found. We eventually fixed the bugs and closed the issues.
The list of closed issues can be found [here](https://github.com/DeliaDumitrescu/3D-Visualizer/issues?q=is%3Aissue+is%3Aclosed).

# Build tool

We used Node.js and TypeScript for the server of the application. 
The TypeScript transpiler is a tool that is used to translate the TypeScript code into JavaScript before running the application. 
We also used Nodemon so that each time we update the code, the server restarts.

# Refactoring, code standards

We did one refactorization in which we split the code of our server into multiple files and ensured that the code follows the JavaScript coding standards.

[Split server code into multiple files](https://github.com/DeliaDumitrescu/3D-Visualizer/commit/a4a953860da9c0142fd2b1eb03358fa229f1219e)

[Code standards](https://github.com/DeliaDumitrescu/3D-Visualizer/commit/edf78ef225006ef22fcbb6157cab1d2f571bd57b)
