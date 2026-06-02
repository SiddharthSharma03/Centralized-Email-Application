Project: Centralized Email Application
Developer: Siddharth Sharma


Here is the completed project code. To make the zip file small enough to send over email, I removed the heavy compiled folders (bin/obj) and the Angular libraries (node_modules). 

Here are the quick steps to run the application on your machine:

--- 1. Prerequisites ---
- .NET SDK installed
- Node.js installed
- SQL Server running locally

--- 2. Backend (C# API) Setup ---
1. Open the Backend folder in your editor.
2. Open the `appsettings.json` file and update the "DefaultConnection" string with your local SQL Server details.
3. Open a terminal in the backend folder and run these two commands:
   dotnet restore
   dotnet run

--- 3. Frontend (Angular) Setup ---
1. Open the Frontend folder.
2. Open a terminal in this folder and run this command to download the libraries:
   npm install
3. Once the installation is finished, start the application by running:
   ng serve


--- 4. Important Note on Email Testing ---
Right now, the `appsettings.json` is configured to use Mailtrap. This is a safe testing sandbox, meaning emails will be trapped and won't actually go to real people's inboxes while you test.

If you want to test sending a REAL email to a real inbox:
1. Open `appsettings.json`.
2. Change the server to `smtp.gmail.com` (Port 587).
3. Put your Gmail address in the Username and Sender fields.
4. Put a generated Google "App Password" in the Password field. (For security, Google requires you to generate a 16-letter App Password from your Google Account Security settings—do not use your real Gmail login password).

Let me know if you run into any issues starting it up.
contact- 8412078496

Thanks,
Siddharth
