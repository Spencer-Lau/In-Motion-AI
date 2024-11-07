// script to import exercise data uploaded to the supabase bucket exercises into the table exercises
// from server directory (cd /server) run: node upload-exercises.js

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv'; // for loading environment variables
dotenv.config(); // ensure the environment variables are loaded

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_STORAGE_BUCKET = 'exercises';
const SUPABASE_API_KEY = process.env.SUPABASE_KEY;
// console.log("Supabase API Key:", SUPABASE_API_KEY);  // for debugging

const localExercisesFolder = '/home/slau/free-exercise-db/exercises'; // path to the local folder where exercises are stored

async function exerciseExists(exerciseId) { // function to check if an exercise already exists in the database
  // const response = await fetch(`${SUPABASE_URL}/rest/v1/exercises?id=eq.${exerciseId}`, {
    try {
      const url = `${SUPABASE_URL}/rest/v1/exercises?id=eq.${exerciseId}`;
      // console.log(`Checking exercise exists with URL: ${url}`); // for debugging
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_API_KEY}`,
          'apikey': SUPABASE_API_KEY, // include the API key as well, although redundant, there were some issues when it was only the Authorization: Bearer
          'Content-Type': 'application/json',
        },
      });
      // console.log("Request Headers:", response.headers);  // log the headers for debugging

    if (!response.ok) {
      const error = await response.text();  // Get error details if available
      console.error(`Failed to check if exercise exists. Response: ${error}`);
      return false;  // Return false if the exercise does not exist
    }

    const data = await response.json();
    // console.log('Fetched exercise data:', data); // for debugging
    return data.length > 0; // returns true if the exercise exists, false otherwise
  } catch (error) {
    console.error(`Error checking exercise existence for ID ${exerciseId}:`, error);
    return false;  // Return false on error to continue processing
  }
}

async function upsertExercise(exercise) { // function to insert or update an exercise in the Supabase database
  const { id, name, force, level, mechanic, equipment, primaryMuscles, secondaryMuscles, instructions, category, images } = exercise;

  const exists = await exerciseExists(id); // check if the exercise already exists in the database

  const method = exists ? 'PATCH' : 'POST'; // choose to update or insert the exercise based on its existence

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/exercises?id=eq.${id}`, { // insert or update the exercise in Supabase database using REST API, 'on_conflict=id' ensures upsert behavior, use `id=eq.${id}` to target a specific exercise for PATCH
    method: method,
    headers: {
      'Authorization': `Bearer ${SUPABASE_API_KEY}`,
      'apikey': SUPABASE_API_KEY, // include the API key as well, although redundant, there were some issues when it was only the Authorization: Bearer
      'Content-Type': 'application/json',
      'Prefer': 'return=representation' // to return the inserted or updated record
    },
    body: JSON.stringify([{
      id,
      name,
      force,
      level,
      mechanic,
      equipment,
      primaryMuscles,
      secondaryMuscles,
      instructions,
      category,
      images: images, // use the uploaded image URLs here
      storage_file_path: `${SUPABASE_URL}/storage/v1/object/public/exercises/exercises.json` // link to the JSON file
    }])
  });

  if (!insertResponse.ok) {
    const error = await insertResponse.json();
    console.error('Error inserting/updating exercise:', error);
  } else {
    console.log(`${exists ? 'Updated' : 'Inserted'} exercise: ${name}`);
  }
}

async function imageExists(filePathInStorage) { // check if an image already exists in Supabase Storage
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${filePathInStorage}`, {
    method: 'HEAD',  // HEAD request is used to check if the file exists
    headers: {
      'Authorization': `Bearer ${SUPABASE_API_KEY}`,
      'apikey': SUPABASE_API_KEY, // include the API key as well, although redundant, there were some issues when it was only the Authorization: Bearer
    }
  });

  return response.status === 200; // returns true if the file exists, false otherwise
}

async function uploadImages(exerciseId, imagePaths) { // upload images to Supabase Storage
  const uploadedImageUrls = [];

  const uploadPromises = imagePaths.map(async (imagePath) => {
    const filePathInStorage = `exercises/${exerciseId}/${imagePath.split('/').pop()}`; // removes any extra folder structure in the imagePath and uses only the filename

    const oldFilePath = `exercises/${exerciseId}/${exerciseId}/${imagePath.split('/').pop()}`; // check if image already exists at the old location (nested structure)
    const oldFileExists = await imageExists(oldFilePath);

    if (oldFileExists) { // remove the old image if it exists
      console.log(`Removing old image: ${oldFilePath}`);
      await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${oldFilePath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_API_KEY}`,
          'apikey': SUPABASE_API_KEY, // include the API key as well, although redundant, there were some issues when it was only the Authorization: Bearer
        }
      });
      console.log(`Deleted old image: ${oldFilePath}`);
    }

    const exists = await imageExists(filePathInStorage); // check if the image already exists

    if (exists) {
      console.log(`Image already exists: ${imagePath}`);
      uploadedImageUrls.push(`${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${filePathInStorage}`);
      return; // skip uploading this image
    }

    console.log(`Uploading image: ${imagePath}`);

    const localImagePath = path.join(localExercisesFolder, imagePath);
    try {
      const fileBuffer = fs.readFileSync(localImagePath);
      const mimeType = 'image/jpeg'; // hardcode MIME type for .jpg images

      const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${filePathInStorage}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_API_KEY}`,
          'apikey': SUPABASE_API_KEY, // include the API key as well, although redundant, there were some issues when it was only the Authorization: Bearer
          'Content-Type': mimeType,
        },
        body: fileBuffer
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image: ${imagePath}`);
      }

      const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${filePathInStorage}`;
      uploadedImageUrls.push(imageUrl);
      console.log(`Uploaded image: ${imagePath}`);
    } catch (error) {
      console.error(`Error reading or uploading file: ${imagePath}`, error);
    }
  })
  await Promise.all(uploadPromises); // Wait for all uploads to complete

  return uploadedImageUrls;
}

async function uploadExercises() { // fetch and process exercises from Supabase Storage and upload them to Supabase database
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/public/exercises/exercises.json`); // fetch exercises.json file from Supabase Storage
    
    if (!response.ok) {
      throw new Error('Failed to fetch exercises.json');
    }

    const exercises = await response.json(); // the data will be an array of exercise objects

    for (let exercise of exercises) { // loop through each exercise and insert it into the Supabase table
      const { id, images } = exercise;

      const uploadedImageUrls = await uploadImages(id, images); // upload images for the current exercise

      // update the exercise with the uploaded image URLs
      exercise.images = uploadedImageUrls; // add the uploaded image URLs to the exercise object
      await upsertExercise(exercise); // insert or update the exercise in the database
    }

    console.log('All exercises and images uploaded successfully!');
  } catch (error) {
    console.error('Error fetching or processing exercises:', error);
  }
}

uploadExercises(); // run the function to upload exercises
