# CS-SoloProject2 - In Motion Exercise Library and Planner


## ✨ ✨ ✨ PROJECT GOAL & STRETCH FEATURES ✨ ✨ ✨

### Goals
- [x] 1.1. Creating a supabase database from the github repo database
- [x] 1.2. Having a functioning front end
- [x] 1.3. Ability to query the supbase-db by id partial match and getting at least one exercise **(MVP 1)**
---
- [x] 2.1. CSS styling
- [x] 2.2. Utilize .env to improve security
- [x] 2.3. Ability to query and return all appropriate exercises
- [x] 2.4. Ability to query by id, category, and/or primaryMuscle **(MVP 2)**
---
- [x] 3.1. Review data flow and refactor
- [ ] 3.2. Learn Tailwind for styling
---
- [ ] 4.1. Ability to create and save user accounts (Perhaps using Google OAuth / Google Identity Platform to login and create new user accounts in Supabase)
- [ ] 4.2. Create a splash / landing page containing the logo and login function
- [ ] 4.3. All current components for the main screen will render once logged in or if previously logged in, skipping the login page
---
- [ ] 5.1. Create a button to expand a toolbar on the main page
- [ ] 5.2. Create buttons on the toolbar to logout, delete account, toggle light / dark mode, view saved workouts (none of this is implemented yet)
---
- [ ] 6.1. Create logout function
- [ ] 6.2. App returns to splash / landing page once logged out
- [ ] 6.3. Connect to logout button on toolbar
---
- [ ] 7.1. Ability to delete user accounts from Supabase
- [ ] 7.2. May implement loggout function and then delete account info from Supabase
- [ ] 7.3. Connect to logout button on toolbar
---
- [ ] 8.1. Create light / dark mode
- [ ] 8.2. Connect to light / dark mode button on toolbar
---
- [ ] 9.1. Ability to save exercises to a list (e.g., marketList?)
- [ ] 9.2. Create a button on the right side of each exercise component, the text being a plus
- [ ] 9.3. The button triggers the save exercises to list function
- [ ] 9.4. saveExerciseToList renders a new component with a dropdown of existing lists or a + New Exercise List option
- [ ] 9.5. Selecting an existing list pushes it to the end of the list
- [ ] 9.6. Selecting a new list pushes the name of the list to the lists category for the user
- [ ] 9.7. The exercise is pushed to that list (relational tables at this point?)
---
- [ ] 10.1. Review plan regarding functionality to delete exercises from lists and to delete lists
- [ ] 10.2. Ability to delete exercises from a list (e.g., marketList?)
- [ ] 10.3. Ability to delete a list to a user's account
---
- [ ] 11.1. Refactor (AS NEEDED / BENFICIAL)
- [ ] 11.2. Tailwind styling (AS NEEDED / BENFICIAL)


## ✨ ✨ ✨ REQUEST-RESPONSE CYCLE / DATA FLOW ✨ ✨ ✨

### 1. Client Side (React Frontend) (App.jsx)

  #### I. Fetching Dropdown Options:
    • On component mount, useEffect invokes fetchOptions to fetch muscle and category dropdown options from http://localhost:8080/api/unique-values (Unique Values Route) which are stored as state in muscleOptions and categoryOptions 

  #### II. User Input & Search Submission:
    • User interacts with search component and submits an exercise search which triggers exerciseSearch function
    • Inputs are managed by useState hooks (searchEntry, muscle, category)

  #### III. Request Construction & Fetch Call:
    • exerciseSearch dynamically builds query parameters, constructing a query using URLSearchParams, and sending an HTTP GET request to the backend endpoint http://localhost:8080/api/search (Exercise Search Route) with the parameters

  #### IV. Receiving & Displaying Search Results:
    • Backend response of matching exercises is stored as state in responseResults
    • Results are rendered as a list showing name, images, and an "Expand" button that triggers additional information to display

### 2. Request Handling (Route and Controller / Backend) (exerciseRoutes.js)

  #### I. Route Handling - Unique Values Route:
    • Following App.jsx fetch request with endpoint /api/unique-values endpoint, GET request route in exerciseRoutes.js routes to exerciseController.getUniqueMuscles and exerciseController.getUniqueCategories middleware (exerciseController.js), each middleware function executes a database query and returns the arrays for uniqueMuscles and uniqueCategories

  #### II. Route Handling - Search Route (exerciseRoutes.js):
    • Following App.jsx fetch request with endpoint /api/search, GET request route in exerciseRoutes.js routes to exerciseController.searchExercises middleware (exerciseController.js)

### 3. Controller Logic (Database Interaction) (exerciseController.js)

  #### I. Fetching Unique Values:
    • exerciseController.getUniqueMuscles and exerciseController.getUniqueCategories each retrieve unique values, i.e., no duplicates, for the categories of "primaryMuscles" and "secondaryMuscles" or "catergory" from exercsies table and sorts them before passing to the next part of the route

  #### II. Dynamic Database Querying:
    • From the dynamically built SQL query from searchExercises, via the associated route, exerciseController.searchExercises executes the query with db.query using the provided non-empty parameters as an array queryParams, of note is important security feature provided by parameterized queries which prevent SQL injection

  #### III. Error Handling:
    • Each controller function logs errors and then passes them via next to the global error handler in index.js for consistent error responses

### 4. Database Connection (PostgreSQL) (exerciseModels.js)

  #### I. Connection Pooling:
    • A PostgreSQL Pool is created using the connection string stored in the environment variable (.env) PG_URI to manage client connections to the database, for efficient query handling by reusing idle connections instead of repeatedly opening new ones

### 5. Response to Client / Server Index (Middleware and Static Serving)

  #### I. App Configuration:
    • cors is used to enable cross-origin requests from http://localhost:3000 (or a production URL)
    • In development mode, the frontend and backend are served separately, with React handling the frontend and Express handling only the API routes
    • Static files from the React build directory are served when in production, which allows the Express server to handle both frontend and backend in a deployed environment
    
  #### II. Error Handling:
    • All errors pass through a global error handler that logs details and responds with a generic error message, ensuring consistent error messages in client responses

### 6. Final Output (User View)

  • The browser renders/displays each matching exercise as a separate list item showing the exercise name, images, and a "Expand" button which toggles additional exercise details/data in real-time


## ✨ ✨ ✨ TESTING APP VIA LIVE SHARE ✨ ✨ ✨

• Join Live Share

• npm install to install dependencies

• npm run prod to build the React frontend and start the backend server

• http://localhost:8080 to access the frontend and backend in a browser


## ✨ ✨ ✨ SETTING SUPABASE BUCKET POLICIES TO IMPORT IMAGES ✨ ✨ ✨

Steps to create public policies for uploads, deletions, and reads:
In Supabase, you can configure public access for your storage bucket by defining policies that allow anyone (unauthenticated users) to interact with the bucket.

### ↺ Allowing File Uploads (POST)
-- Allow uploading files to the 'exercises' bucket by anyone (no authentication required)
create policy "Allow uploads" on storage.objects for insert
with
  check (bucket_id = 'exercises');
### ↺ Allowing File Deletions (DELETE)
-- Allow deleting files from the 'exercises' bucket by anyone (no authentication required)
create policy "Allow deletions" on storage.objects
for delete
using (bucket_id = 'exercises');

### ↺ Allowing File Reads (SELECT)
-- Allow reading files from the 'exercises' bucket by anyone (no authentication required)
create policy "Allow read access" on storage.objects
for select
using (bucket_id = 'exercises');
