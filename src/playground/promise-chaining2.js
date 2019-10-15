require('../db/mongoose')
const Task = require('../models/task')

// Task.findByIdAndDelete({ _id: '5da0e811fe77bb59e71cd194'}).then((tasks) => {
//   console.log(tasks)
//   return Task.countDocuments({ completed: false })
// }).then((count) => {
//   console.log(count)
// }).catch((e) => {
//   console.log(e)
// })

const deleteTaskAndCount = async (id) => {
  const task = await Task.findByIdAndDelete(id)
  const count = await Task.countDocuments({completed: false})
  return count
}

deleteTaskAndCount("5da0d867860e7a55f4da179a").then((count) => {
  console.log(count)
}).catch((e) => {
  console.log(e)
})