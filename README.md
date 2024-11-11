# CS-SoloProject2
✨ ✨ ✨ ✨ ✨ PROJECT GOAL & STRETCH FEATURES ✨ ✨ ✨ ✨ ✨

Goals
<!-- 1. Creating a supabase database from the github repo database -->
<!-- 2. Having a functioning front end -->
<!-- 3. Ability to query the supbase-db by id partial match and getting at least one exercise (MVP) -->
<!-- 4. Ability to query and return all appropriate exercises -->
<!-- 5. Ability to query by id, category, and/or primaryMuscle -->
6. Ability to save exercises to a list (e.g., marketList?)
7. Ability to delete exercises from a list (e.g., marketList?)
8. Ability to create and save user accounts
9. Ability to delete user accounts
10. Ability to save and delete a list to a user's account
<!-- 11. Utilize .env to improve security -->
00. Styling

✨ ✨ ✨ ✨ ✨ REQUEST-RESPONSE CYCLE / DATA FLOW ✨ ✨ ✨ ✨ ✨



✨ ✨ ✨ ✨ ✨ TESTING APP VIA LIVE SHARE ✨ ✨ ✨ ✨ ✨

Join Live Share
npm install to install dependencies
npm run build to build the React app

✨ ✨ ✨ ✨ ✨ SETTING SUPABASE BUCKET POLICIES TO IMPORT IMAGES ✨ ✨ ✨ ✨ ✨

Steps to create public policies for uploads, deletions, and reads:
In Supabase, you can configure public access for your storage bucket by defining policies that allow anyone (unauthenticated users) to interact with the bucket.

1. Allowing File Uploads (POST)
-- Allow uploading files to the 'exercises' bucket by anyone (no authentication required)
create policy "Allow uploads" on storage.objects for insert
with
  check (bucket_id = 'exercises');

2. Allowing File Deletions (DELETE)
-- Allow deleting files from the 'exercises' bucket by anyone (no authentication required)
create policy "Allow deletions" on storage.objects
for delete
using (bucket_id = 'exercises');

3. Allowing File Reads (SELECT)
-- Allow reading files from the 'exercises' bucket by anyone (no authentication required)
create policy "Allow read access" on storage.objects
for select
using (bucket_id = 'exercises');
