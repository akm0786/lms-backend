import { Router } from 'express';
import { addLectureToCourseById, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from '../controllers/course.controller.js';
import { isLoggedIn, authorizeRoles, authorizedSubscriber } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
const router = Router();

// router.get('/', getAllCourses);
// router.post('/', upload.single('thumbnail'), isLoggedIn, authorizeRoles('ADMIN'), createCourse);
// router.put('/:id', isLoggedIn, updateCourse);
// router.delete('/:id', isLoggedIn, removeCourse);
// router.get('/:id', isLoggedIn, getLecturesByCourseId);
// router.post('/:id', isLoggedIn, authorizeRoles('ADMIN'), upload.single('lecture'), addLectureToCourseById);

// creating new route via new look


router.route('/')
    .get(isLoggedIn, getAllCourses)
    .post(isLoggedIn, authorizeRoles('ADMIN'), upload.single('thumbnail'), createCourse);

router.route('/:id')
    .get(isLoggedIn, authorizedSubscriber, getLecturesByCourseId)
    .put(isLoggedIn, authorizeRoles('ADMIN'), updateCourse)
    .delete(isLoggedIn, authorizeRoles('ADMIN'), removeCourse)
    .post(isLoggedIn, authorizeRoles('ADMIN'), upload.single('lecture'), addLectureToCourseById);

export default router;