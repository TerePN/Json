const htpp = require("http");
const path = require("path");
const fs = require("fs/promises");

const PORT = 8000;
const writeApp = async (path, arr) => {
    await fs.writeFile(path, JSON.stringify(arr))
}

const app = htpp.createServer(async (req, res) => {
    const method = req.method;
    const url = req.url;
    const jsonPath = path.resolve("./data.json");
    const jsonFile = await fs.readFile(jsonPath, "utf-8");

    if (url === "/apiv1/tasks/" && method === "GET") {
        console.log(req.url);
        res.setHeader("Content-Type", "application/json");
        console.log(jsonFile);
        res.writeHead("200")
        res.write(jsonFile)
    }
    if (url.includes('/apiv1/tasks/') && method === "POST") {
        console.log(res.body);
        req.on('data', async (data) => {
            // console.log(JSON.parse(data));
            const newTask = JSON.parse(data);
            const arr = JSON.parse(jsonFile);
            const id = arr[arr.length - 1].id;
            newTask.id = id + 1
            const lastObject = arr.sort((a, b) =>
                a.id - b.id
            )
            arr.push(newTask);
            console.log(arr);
            await writeApp(jsonPath, arr);
        })
    }
        //PUT
        if (url.includes("/apiv1/tasks/") && method === 'PUT') {
            const splitUrl = url.split('/');
            const id = Number(splitUrl[splitUrl.length - 1]); 
            const arr = JSON.parse(jsonFile);
            res.setHeader("Content-Type", "application/json");
            res.writeHead(202);
            req.on('data', async(data)=> {
                data = JSON.parse(data);
                const newArr =  arr.map((task)=> {
                    if (task.id === id){
                        task.status = data.status
                    }
                    return task;
                });
                await writeApp(jsonPath, newArr);
                console.log(newArr);
            });
            console.log(url.includes("/apiv1/tasks/"));
        }

        //DELETE
        if (url.includes("/apiv1/tasks/") && method === 'DELETE') {
            const splitUrl = url.split('/');
            const id = Number(splitUrl[splitUrl.length-1]);
            const arr = JSON.parse(jsonFile);
            // res.writeHead(201, {"Content-Type": "application/json"});
            const deleteJson = arr.filter(obj => obj.id !== id);
            await writeApp(jsonPath, deleteJson)
            console.log(deleteJson);
        }

    if(url !== "/apiv1/tasks/" && !url.includes("/apiv1/tasks/")){
        res.writeHead(503);
    }

    res.end();
});




app.listen(PORT);

console.log('corriendo');