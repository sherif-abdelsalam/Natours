const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const AppErrors = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Why do we need Multer?
// Normally, Express doesn’t understand file uploads by itself because files are sent as binary data in HTTP requests.
// Multer:
// - Parses the incoming request.
// - Extracts the files.
// - Stores them in memory or on disk (depending on your config).
// - Adds the file(s) info to req.file or req.files, so you can work with them in your routes.

//----------------Disk Storage Example -------------------
//
// const multerStorage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function(req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

// ⚡ Typical real-world workflow (recommended):

// - Use memoryStorage.
// - Process file with Sharp.
// - Upload to cloud storage.
// - Store only the cloud URL in your database.

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErrors('Not an image! Please upload only images!!'), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  console.log('file', req.file);

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500) //
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObjBody = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppErrors(
        'This route is not for password updates. Please use /updatePassword',
        400
      )
    );
  }

  const filteredBody = filterObjBody(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please use /signup instead'
  });
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
const getUser = factory.getOne(User);

const getAllUsers = factory.getAll(User, 'users');

// Do not update passwords with this!
// because we are using findByIdAndUpdate which does not run pre save middleware
// so the password will not be hashed
// and also we are not allowing to update password here
// so we are using filterObjBody to only allow name and email to be updated
//// use updateMe to update password
const updateUser = factory.updateOne(User);

// Delete user is admin only
const deleteUser = factory.deleteOne(User);

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto
};
