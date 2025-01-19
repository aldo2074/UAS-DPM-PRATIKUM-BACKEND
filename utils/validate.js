const validateInput = (data, fields) => {
    const errors = {};
    fields.forEach((field) => {
      if (!data[field]) {
        errors[field] = `${field} is required`;
      }
    });
    return errors;
  };
  
  module.exports = { validateInput };
  