import { Hono } from "hono";
import qs from "qs";
import { getRecords , getRecord} from "../cms/data/data";
import * as schema from "../db/schema";
import { drizzle } from "drizzle-orm/d1";
import {decodeJwtMiddleware} from "./cloudflare_access";

const up = new Hono();
up.use('*', decodeJwtMiddleware)

up.get("/my-prompts", async (ctx) => {
  var params = qs.parse(ctx.req.query());
  console.log("params", params);
  params["filters"] = { userId: ctx.get("x-cf-email") };
  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "user_prompt",
    params,
    ctx.req.url,
    "d1"
  );
  return ctx.json(data);
});

up.get("/:user_id/my-prompts", async (ctx) => {
  var params = qs.parse(ctx.req.query());
  console.log("params", params);
  const user_id = ctx.req.param('user_id');
  params["filters"] ={ userId: user_id};
  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "user_prompt",
    params,
    ctx.req.url,
    "d1"
  );
  return ctx.json(data);
});

up.get("/", async (ctx) => {
    var params = qs.parse(ctx.req.query());
    console.log("params", params);
    params["filters"] = { userId: ctx.get("x-cf-email") };
    const data = await getRecords(
      ctx.env.D1DATA,
      ctx.env.KVDATA,
      "user_prompt",
      params,
      ctx.req.url,
      "d1"
    );
    console.log(data);
    const records = data.data.map((item, index) => `
    <li>
        ${item.prompt_name}
        <a href="./update/${item.id}">Update</a>
        <a href="./delete?id=${item.id}">Delete</a>
        <a target="_blank" href="https://platzi.com/ai-chat?evaluate=${item.id}">Test</a>
    </li>
    `).join('');

    const mainPage = `
      <h2>Prompt List</h2>
      <ul>
          ${records}
      </ul>
      <a href="./create">Create New Prompt</a>
  `;
  return ctx.html(mainPage);
    
  });

up.get("/create", async (ctx) => {
  const createUserPromptForm = `
    <h1>Create User Prompt</h1>
    <form id="createForm" method="POST">
        <label for="promptName">Prompt Name:</label>
        <input type="text" id="promptName" name="prompt_name"  required><br><br>
        <label for="basePrompt">Base Prompt:</label>
        <input type="text" id="basePrompt" name="base_prompt" required><br><br>

        <label for="inputVariables">Input Variables:</label>
        <input type="text" id="inputVariables" name="input_variables"  required><br><br>
        
        <label for="humanTemplate">Human Template:</label>
        <input type="text" id="humanTemplate" name="human_template"  required><br><br>
        
        <label for="model">Model:</label>
        <select id="model" name="model">
            <option value="gpt-3.5" selected >GPT-3.5</option>
            <option value="gpt4" >GPT-4</option>
        </select><br><br>
        
        <label for="memorySize">Memory Size:</label>
        <input type="number" id="memorySize" name="memory_size" value="10" required><br><br>
        
        <label for="intro">Intro:</label>
        <input type="text" id="intro" name="intro"  required><br><br>
        
        <label for="outro">Outro:</label>
        <input type="text" id="outro" name="outro"  required><br><br>
        
        <label for="temperature">Temperature:</label>
        <input type="number" id="temperature" name="temperature" step="0.01" value="1" required><br><br>
        
        <label for="description">Description:</label>
        <input type="text" id="description" name="description"  required><br><br>
        
        <label for="hidden">Hidden:</label>
        <input type="checkbox" id="hidden" name="hidden"}><br><br>
        
        <input type="hidden" id="userId" name="userId" value="${ctx.get('x-cf-email')}" required><br><br>
        
        <!-- Add input fields for other properties based on your schema -->
        
        <button type="submit">Create</button>
        <button type="button" onclick="window.location.href='/v1/up/'">Cancel</button>
    </form>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const form = document.getElementById("createForm");

            form.addEventListener("submit", function (e) {
                e.preventDefault(); // Prevent the default form submission

                // Collect form data
                const formData = new FormData(form);
                const jsonData = {};
                jsonData["data"] = {};
                // Convert form data to JSON
                formData.forEach((value, key) => {
                    jsonData["data"][key] = value;
                });

                // Define the relative endpoint URL
                const endpoint = "/v1/user_prompt"; // Replace with your API's relative URL

                // Send a POST request to the relative endpoint
                fetch(endpoint, {
                    method: "POST",
                    body: JSON.stringify(jsonData),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                .then(response => response.json())
                .then(data => {
                    // Handle the response here, you can show a success message or redirect the user
                    console.log("Response from server:", data);
                    window.location.href = "/v1/up/";
                })
                .catch(error => {
                    // Handle errors, e.g., show an error message to the user
                    console.error("Error:", error);
                });
            });
        });
    </script>
`;
return ctx.html(createUserPromptForm);
});

up.get("/update/:id", async (ctx) => {
  const id = ctx.req.param('id')
  console.log('id', id);
  const data = await getRecord(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "user_prompt",
    {id},
    ctx.req.path,
    "d1"
  );
  const updateUserPromptForm = `
    <h1>Update User Prompt</h1>
    <form id="updateForm" method="PUT">
        <label for="updatePromptName">Prompt Name:</label>
        <input type="hidden" id="id" name="id" value="${id}">
        <input type="text" id="updatePromptName" name="prompt_name" value="${data.prompt_name}" required><br><br>
        
        <label for="updateBasePrompt">Base Prompt:</label>
        <input type="text" id="updateBasePrompt" name="base_prompt" value="${data.base_prompt}" required><br><br>

        <label for="updateInputVariables">Input Variables:</label>
        <input type="text" id="updateInputVariables" name="input_variables" value="${data.input_variables}" required><br><br>
        
        <label for="updateHumanTemplate">Human Template:</label>
        <input type="text" id="updateHumanTemplate" name="human_template" value="${data.human_template}" required><br><br>
        
        <label for="updateModel">Model:</label>
        <select id="updateModel" name="model">
            <option value="gpt-3.5" ${data.model === 'gpt-3.5' ? 'selected' : ''}>GPT-3.5</option>
            <option value="gpt4" ${data.model === 'gpt4' ? 'selected' : ''}>GPT-4</option>
        </select><br><br>
        
        <label for="updateMemorySize">Memory Size:</label>
        <input type="number" id="updateMemorySize" name="memory_size" value="${data.memory_size}" required><br><br>
        
        <label for="updateIntro">Intro:</label>
        <input type="text" id="updateIntro" name="intro" value="${data.intro}" required><br><br>
        
        <label for="updateOutro">Outro:</label>
        <input type="text" id="updateOutro" name="outro" value="${data.outro}" required><br><br>
        
        <label for="updateTemperature">Temperature:</label>
        <input type="number" id="updateTemperature" name="temperature" step="0.01" value="${data.temperature}" required><br><br>
        
        <label for="updateDescription">Description:</label>
        <input type="text" id="updateDescription" name="description" value="${data.description}" required><br><br>
        
        <label for="updateHidden">Hidden:</label>
        <input type="checkbox" id="updateHidden" name="hidden" ${data.hidden ? 'checked' : ''}><br><br>
        
        <label for="updateUserId">User ID:</label>
        <input type="text" id="updateUserId" name="userId" value="${data.userId}" required><br><br>
        
        <!-- Add input fields for other properties based on your schema -->
        
        <input type="hidden" id="updateId" name="id" value="${data.id}">
        
        <button type="submit">Update</button>
        <button type="button" onclick="window.location.href='/v1/up/'">Cancel</button>
    </form>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const form = document.getElementById("updateForm");

            form.addEventListener("submit", function (e) {
                e.preventDefault(); // Prevent the default form submission

                // Collect form data
                const formData = new FormData(form);
                const jsonData = {};
                jsonData["data"] = {};
                // Convert form data to JSON
                formData.forEach((value, key) => {
                    jsonData["data"][key] = value;
                });

                // Define the relative endpoint URL
                const endpoint = "/v1/user_prompt/${data.id}"; // Replace with your API's relative URL

                // Send a POST request to the relative endpoint
                fetch(endpoint, {
                    method: "PUT",
                    body: JSON.stringify(jsonData),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                .then(response => response.json())
                .then(data => {
                    // Handle the response here, you can show a success message or redirect the user
                    console.log("Response from server:", data);
                    window.location.href = "/v1/up/";
                })
                .catch(error => {
                    // Handle errors, e.g., show an error message to the user
                    console.error("Error:", error);
                });
            });
        });
    </script>
    `;
  return ctx.html(updateUserPromptForm);
  });

export  { up };
