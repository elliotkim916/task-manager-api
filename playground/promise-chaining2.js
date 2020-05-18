'use strict';

require('../src/db/mongoose');
const Task = require('../src/models/task');

// Task.findByIdAndDelete('5eb4b4296553c93199da927d')
//   .then(res => {
//     console.log(res);
//     return Task.countDocuments({ completed: false });
//   })
//   .then(count => {
//     console.log('count', count);
//   })
//   .catch(e => {
//     console.log(e);
//   });

const deleteTaskAndCount = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  const count = await Task.countDocuments({ completed: false });
  return count;
};

deleteTaskAndCount('5eb5d232f62ac53987663b72')
  .then(count => console.log(count))
  .catch(e => console.log(e));