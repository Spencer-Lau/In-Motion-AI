import express from 'express'; // imports express
import exerciseController from '../controllers/exerciseController.js'; // imports exerciseController module

const router = express.Router(); // imports Router() from Express

router.get('/search', exerciseController.searchExercises); // route for searches

export default router;
