const User = require('../models/User');

const searchUser = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    res.status(400);
    throw new Error('Please send username to search');
  }

  try {
    const user = await User.findOne({ username }).select('-email');

    if (!user) {
      return res.status(200).json({ username: null, userId: null, fullname:null,message: 'User not found' });
    } else {
      return res.status(200).json({ username: user.username, userId: user._id, fullname:user.fullname, message: 'User found' });
    }
  } catch (error) {
    console.error('Error searching for user:', error);
    return res.status(500).json({ message: 'Server error during user search' });
  }
};

module.exports = { searchUser };