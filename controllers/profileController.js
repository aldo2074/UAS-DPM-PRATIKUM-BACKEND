const User = require('../models/User');

const updateProfile = async (req, res) => {
  try {
    console.log('Received profile update request:', {
      body: req.body,
      userId: req.userId
    });

    const { name, email } = req.body;
    const userId = req.userId;

    // Validasi input
    if (!name || !name.trim()) {
      const response = {
        success: false,
        message: 'Nama tidak boleh kosong'
      };
      console.log('Sending validation error response:', response);
      return res.status(400).json(response);
    }

    // Update user dengan validasi email
    const updateData = {
      name: name.trim(),
      email: email ? email.trim() : null
    };

    console.log('Updating user with data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        select: '-password',
        runValidators: true 
      }
    );

    if (!updatedUser) {
      const response = {
        success: false,
        message: 'User tidak ditemukan'
      };
      console.log('User not found response:', response);
      return res.status(404).json(response);
    }

    const response = {
      success: true,
      message: 'Profil berhasil diperbarui',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username
      }
    };

    console.log('Sending success response:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Profile update error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    const errorResponse = {
      success: false,
      message: 'Terjadi kesalahan saat memperbarui profil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };

    console.log('Sending error response:', errorResponse);
    return res.status(500).json(errorResponse);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data profil'
    });
  }
};

module.exports = {
  updateProfile,
  getProfile
};
