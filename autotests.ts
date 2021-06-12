import { deleteUser, findUser, getUsersWithSubstring, insertUser } from "./database";
import { moveFileFromTempDir } from "./upload";
import fs from 'fs';

var TEST_USERNAME = "testUser";
var TEST_USER_SEARCH = "testU";

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

export function deleteModelTest(){
    try {
        fs.unlinkSync("./public/data/testUser/pasta-test.glb");
        console.log("Test passed : deleting user model!");
    } catch(err) {
        console.error(err);
        console.error("Test failed : deleting user model!");
    }
}


export function runAutomatedTests(){
    runAddUserTest();
}