import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  sentence: {
    type: String,
    required: true,
    maxlength: 200, // Limit the sentence to 200 characters
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v); // Basic URL validation
      },
      message: props => `${props.value} is not a valid URL!`
    },
  },
  type:{
    type: String,
    enum: ['achievements', 'news'],
    default: 'news',
  }
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);

export default News;
