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
      secure_url: "https://www.vecteezy.com/vector-art/4141669-no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-vector-illustration",
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

const removeLectureFromCourse = async (req, res, next) => {
  try{
    const {courseId, lectureId} = req.query;

  if(!courseId)
  {
    return next(new AppError('Course id is required', 400));
  }
  if(!lectureId)
  {
    return next(new AppError('Lecture id is required', 400));
  }

  const course = await Course.findById(courseId);

  if(!course)
  {
    return next(new AppError('Course with given id not found', 404));
  }

  const lectureIndex = course.lectures.findIndex(
      (lec) => lec._id.toString() === lectureId
    );

    if (lectureIndex === -1) {
      return next(new AppError('Lecture not found in this course', 404));
    }

    const lecture = course.lectures[lectureIndex];
    const publicId = lecture.lecture?.public_id;

    // 4. (Optional) Delete video from Cloudinary
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      } catch (cloudErr) {
        console.warn(`Failed to delete Cloudinary asset ${publicId}:`, cloudErr.message);
      }
    }

    course.lectures.splice(lectureIndex, 1);

    course.numberOfLectures = course.lectures.length;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lecture removed from course successfully',
      course
    })

  }catch(e){
    return next(new AppError('Something went wrong', 500));
  }
}

export { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse, addLectureToCourseById, removeLectureFromCourse };