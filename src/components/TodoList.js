import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const TodoList = () => {
  const [todoLists, setTodoLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [taskInputs, setTaskInputs] = useState({});
  const [draggedTask, setDraggedTask] = useState(null);

  const auth = getAuth();
  const navigate = useNavigate();

  const fetchTodoLists = async (user) => {
    if (user) {
      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${user.uid}/todoLists`)
        );
        const fetchedLists = await Promise.all(
          querySnapshot.docs.map(async (listDoc) => {
            const tasksSnapshot = await getDocs(
              collection(db, `users/${user.uid}/todoLists/${listDoc.id}/tasks`)
            );
            const tasks = tasksSnapshot.docs.map((taskDoc) => ({
              id: taskDoc.id,
              ...taskDoc.data(),
            }));
            return {
              id: listDoc.id,
              ...listDoc.data(),
              tasks,
            };
          })
        );
        setTodoLists(fetchedLists);
      } catch (error) {
        console.error("Error fetching To-Do Lists: ", error);
      }
    }
  };

  const addTodoList = async () => {
    const user = getAuth().currentUser;
    if (newListName.trim() && user) {
      try {
        await addDoc(collection(db, `users/${user.uid}/todoLists`), {
          name: newListName,
          createdBy: user.email,
          createdAt: new Date(),
        });
        fetchTodoLists(user);
        setNewListName("");
      } catch (error) {
        console.error("Error adding To-Do List: ", error);
      }
    }
  };

  const handleTaskInputChange = (listId, field, value) => {
    setTaskInputs((prev) => ({
      ...prev,
      [listId]: { ...prev[listId], [field]: value },
    }));
  };

  const addTask = async (listId) => {
    const user = getAuth().currentUser;
    const newTask = taskInputs[listId];
    if (newTask?.title.trim() && user) {
      try {
        await addDoc(
          collection(db, `users/${user.uid}/todoLists/${listId}/tasks`),
          {
            ...newTask,
            priority: newTask.priority || "low",
            createdAt: new Date(),
          }
        );
        fetchTodoLists(user);
        setTaskInputs((prev) => ({
          ...prev,
          [listId]: {
            title: "",
            description: "",
            dueDate: "",
            priority: "low",
          },
        }));
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Handling drag start
  const handleDragStart = (task, listId) => {
    setDraggedTask({ ...task, listId });
  };

  // Handling drop event to move task between lists or within the same list
  const handleDrop = async (targetListId, priority) => {
    const user = getAuth().currentUser;
    if (draggedTask) {
      try {
        const sourceTaskDocRef = doc(
          db,
          `users/${user.uid}/todoLists/${draggedTask.listId}/tasks`,
          draggedTask.id
        );

        // Prepare task data with defaults
        const newTaskData = {
          title: draggedTask.title || "Untitled Task", // Provide a default title if none
          description: draggedTask.description || "",   // Default to an empty string if undefined
          dueDate: draggedTask.dueDate || null,         // Default to null if no due date
          priority: priority || draggedTask.priority,    // Use the dropped priority
          createdAt: new Date(),                         // Set createdAt to now for new task
        };

        // Move task to a different list
        if (draggedTask.listId !== targetListId) {
          // Create a new task in the target list
          await addDoc(
            collection(db, `users/${user.uid}/todoLists/${targetListId}/tasks`),
            newTaskData
          );

          // Remove the task from the source list
          await deleteDoc(sourceTaskDocRef);
        } else if (draggedTask.priority !== priority) {
          // Move within the same list but change priority
          await updateDoc(sourceTaskDocRef, {
            priority: priority,
          });
        }

        // Refresh lists
        fetchTodoLists(user);
      } catch (error) {
        console.error("Error moving task: ", error);
      } finally {
        setDraggedTask(null); // Clear dragged task after operation
      }
    }
  };

  // Prevent default dragover behavior
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTodoLists(user);
      } else {
        setTodoLists([]);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6" // Changed to bg-white
      onDragOver={handleDragOver}
    >
      <div className="max-w-4xl w-full bg-gray-50 shadow-lg rounded-lg p-8 flex flex-col justify-between"> {/* Changed to bg-gray-50 */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6"> {/* Updated text color */}
            To-Do App
          </h2>

          <div className="mb-4 flex justify-between">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-pink-500 transition" // Updated input styles
              placeholder="Create new To-Do List"
            />
            <button
              onClick={addTodoList}
              className="ml-4 bg-pink-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-pink-700 transition" // Updated button color
            >
              Add List
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {todoLists.map((list) => (
              <div
                key={list.id}
                className="p-6 bg-gray-200 rounded-lg shadow-md" // Changed to bg-gray-200
              >
                <h3 className="text-xl font-bold text-gray-800">{list.name}</h3> {/* Updated text color */}

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input
                    type="text"
                    value={taskInputs[list.id]?.title || ""}
                    onChange={(e) =>
                      handleTaskInputChange(list.id, "title", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-pink-500 transition" // Updated input styles
                    placeholder="Task Title"
                  />
                  <input
                    type="text"
                    value={taskInputs[list.id]?.description || ""}
                    onChange={(e) =>
                      handleTaskInputChange(
                        list.id,
                        "description",
                        e.target.value
                      )
                    }
                    className="p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-pink-500 transition" // Updated input styles
                    placeholder="Task Description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input
                    type="date"
                    value={taskInputs[list.id]?.dueDate || ""}
                    onChange={(e) =>
                      handleTaskInputChange(list.id, "dueDate", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-pink-500 transition" // Updated input styles
                  />
                  <select
                    value={taskInputs[list.id]?.priority || "low"}
                    onChange={(e) =>
                      handleTaskInputChange(list.id, "priority", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-pink-500 transition" // Updated input styles
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <button
                  onClick={() => addTask(list.id)}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-pink-700 transition" // Updated button color
                >
                  Add Task
                </button>

                {["low", "medium", "high"].map((priority) => (
                  <div
                    key={priority}
                    className={`p-4 rounded-lg mt-4 ${
                      priority === "low"
                        ? "bg-green-600"
                        : priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    onDrop={() => handleDrop(list.id, priority)}
                  >
                    <h4 className="text-md font-bold text-white capitalize mb-2">
                      {priority} Priority
                    </h4>
                    <ul>
                      {list.tasks
                        .filter((task) => task.priority === priority)
                        .map((task) => (
                          <li
                            key={task.id}
                            className="bg-gray-800 text-white p-2 rounded-lg shadow-md mb-2 cursor-pointer"
                            draggable
                            onDragStart={() => handleDragStart(task, list.id)}
                          >
                            {task.title} - {task.dueDate}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-500 transition mt-6"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default TodoList;
