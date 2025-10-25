import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";


const getAllCourses = async (req, res, next) => {

  try {

    const courses = await Course.find({}).select('-lectures');

    res.status(200).json({
      success: true,
      message: 'All Courses',
      courses
    })
  } catch (e) {
    return next(new AppError('Something went wrong', 500));
  }

}

const getLecturesByCourseId = async (req, res, next) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    if (!course.lectures || course.lectures.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Course found but no lectures available",
        lectures: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Course Lectures Fetched Successfully",
      lectures: course.lectures,
    });
  } catch (e) {
    console.error("Error in getLecturesByCourseId:", e.message);
    return next(new AppError("Something went wrong", 500));
  }
};

const createCourse = async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy) {
    return next(new AppError("All fields are required", 400));
  }

  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: "dummy",
      secure_url: "dummy",
    },
  });

  if (!course) {
    return next(new AppError("Could not create course", 500));
  }

  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "lms",
    });

    if (result) {
      course.thumbnail.public_id = result.public_id;
      course.thumbnail.secure_url = result.secure_url;
    }

    fs.rm(`uploads/${req.file.filename}`);
  }
  await course.save();

  res.status(200).json({
    success: true,
    message: "Course created successfully",
    course,
  });

};

const updateCourse = async (req, res, next) => {

  const { id } = req.params;

  try {

    const course = await Course.findByIdAndUpdate(id, { $set: req.body }, { runValidators: true });
    if (!course) {
      return next(new AppError('Course with given id not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    })
  } catch (e) {
    return next(new AppError('Something went wrong', 500));
  }

};

const removeCourse = async (req, res, next) => {

  const { id } = req.params;

  try {

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return next(new AppError('Course with given id not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      course
    })


  } catch (e) {
    return next(new AppError('Something went wrong', 500));
  }

};

const addLectureToCourseById = async (req, res, next) => {

  const { id } = req.params;
  const { title, description } = req.body;

  try {

    if (!title || !description) {
      return next(new AppError('All fields are required', 400));
    }

    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError('Course with given id not found', 404));
    }

    const lectureData = {
      title,
      description,
      lecture: {}
    }

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });

        if (result) {
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
        }

        fs.rm(`uploads/${req.file.filename}`);
      } catch (e) {
        // show the error message
        return next(new AppError('Something went wrong while uploading', 500));
      }
    }

    course.lectures.push(lectureData);

    course.numberOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lecture added to course successfully',
      course
    })
  } catch (e) {
    return next(new AppError('Something went wrong', 500));
  }

}

export { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse, addLectureToCourseById };