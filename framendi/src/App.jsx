import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [lastWorkoutMessage, setLastWorkoutMessage] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [customExercises, setCustomExercises] = useState([]);
  const [newExerciseName, setNewExerciseName] = useState('');

  const defaultExerciseOptions = [
    'Bench Press',
    'Squat',
    'Deadlift',
    'Overhead Press',
    'Barbell Row',
    'Pull Up',
    'Lat Pulldown',
    'Leg Press',
    'Bicep Curl',
    'Tricep Pushdown',
  ];

  const exerciseOptions = [
    ...defaultExerciseOptions,
    ...customExercises.map((exercise) => exercise.name),
  ];

  useEffect(() => {
    if (!user) return;

    fetch(`https://einstaklingsverkefni-vefforritun2.onrender.com/api/workouts?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWorkouts(data);
        } else {
          setWorkouts([]);
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setWorkouts([]);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetch(`https://einstaklingsverkefni-vefforritun2.onrender.com/api/exercises?username=${user.username}`)
      .then((res) => res.json())
      .then((data) => setCustomExercises(data))
      .catch((err) => console.error('Exercise fetch error:', err));
  }, [user]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!exercise || !weight || !reps) {
      alert('Please fill in all fields');
      return;
    }

    console.log('user object:', JSON.stringify(user, null, 2));
    console.log('user.id:', user?.id);
    console.log('exercise:', exercise);
    console.log('weight:', weight);
    console.log('reps:', reps);

    const newWorkout = {
      userId: user?.id,
      exercise,
      weight: Number(weight),
      reps: Number(reps),
    };

    console.log('newWorkout being sent:', JSON.stringify(newWorkout, null, 2));

    try {
      const response = await fetch('https://einstaklingsverkefni-vefforritun2.onrender.com/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkout),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Add workout backend error:', errorData);
        throw new Error(errorData.error || 'Failed to add workout');
      }

      const savedWorkout = await response.json();

      setWorkouts((prevWorkouts) => [...prevWorkouts, savedWorkout]);
      setExercise('');
      setWeight('');
      setReps('');
      setLastWorkoutMessage('');
    } catch (error) {
      console.error('Error adding workout:', error);
      alert(error.message);
    }
  };
  const handleDelete = async (id) => {
    if (!user?.id) {
      alert('User ID is missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch(
        `https://einstaklingsverkefni-vefforritun2.onrender.com/api/workouts/${id}?userId=${user.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete workout');
      }

      const updatedWorkouts = workouts.filter((workout) => workout.id !== id);
      setWorkouts(updatedWorkouts);

      if (exercise) {
        const matchingWorkouts = updatedWorkouts.filter(
          (workout) =>
            workout.exercise.toLowerCase() === exercise.toLowerCase()
        );

        if (matchingWorkouts.length > 0) {
          const lastWorkout = matchingWorkouts[matchingWorkouts.length - 1];

          setLastWorkoutMessage(
            `Last time: ${lastWorkout.weight}kg x ${lastWorkout.reps}`
          );
        } else {
          setLastWorkoutMessage('No previous workout found for this exercise.');
        }
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://einstaklingsverkefni-vefforritun2.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error);
        return;
      }

      setUser(data.user);
      setLoginError('');
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://einstaklingsverkefni-vefforritun2.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error);
        return;
      }

      setUser(data.user);
      setLoginError('');
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleExerciseChange = (e) => {
    const selectedExercise = e.target.value;
    setExercise(selectedExercise);

    const matchingWorkouts = workouts.filter(
      (workout) =>
        workout.exercise.toLowerCase() === selectedExercise.toLowerCase()
    );

    if (matchingWorkouts.length > 0) {
      const lastWorkout = matchingWorkouts[matchingWorkouts.length - 1];

      setLastWorkoutMessage(
        `Last time: ${lastWorkout.weight}kg x ${lastWorkout.reps}`
      );
    } else {
      setLastWorkoutMessage('No previous workout found for this exercise.');
    }
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();

    if (!newExerciseName.trim()) {
      alert('Please enter an exercise name');
      return;
    }

    try {
      const response = await fetch('https://einstaklingsverkefni-vefforritun2.onrender.com/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          name: newExerciseName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      setCustomExercises((prev) => [...prev, data]);
      setNewExerciseName('');
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  if (!user) {
    return (
      <div className="app-container">
        <h1>Kraftur</h1>
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>

        <form onSubmit={isSignup ? handleSignup : handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            {isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        {loginError && <p className="error">{loginError}</p>}

        <button onClick={() => {
          setIsSignup(!isSignup);
          setLoginError('');
        }}>
          {isSignup
            ? 'Already have an account? Login'
            : 'New user? Sign up'}
        </button>
      </div>
    );
  }

  const groupedWorkouts = workouts.reduce((groups, workout) => {
    const exerciseName = workout.exercise;

    if (!groups[exerciseName]) {
      groups[exerciseName] = [];
    }

    groups[exerciseName].push(workout);

    return groups;
  }, {});

  const sortedGroupedWorkouts = Object.entries(groupedWorkouts).sort(
    ([exerciseA], [exerciseB]) => exerciseA.localeCompare(exerciseB)
  );

  return (
    <div className='app-container'>
      <h1>Kraftur</h1>
      <h2>Add New Exercise</h2>
      <form onSubmit={handleAddExercise}>
        <input
          type="text"
          placeholder="Exercise name"
          value={newExerciseName}
          onChange={(e) => setNewExerciseName(e.target.value)}
        />
        <button type="submit">Add Exercise</button>
      </form>
      <h2>Add Workout</h2>
      <form onSubmit={handleSubmit}>
        <select value={exercise} onChange={handleExerciseChange}>
          <option value="">Select exercise</option>
          {exerciseOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {exercise && <p className='message'>{lastWorkoutMessage}</p>}

        <input
          type="number"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />

        <button type="submit">Add Workout</button>
      </form>
      <div className="top-bar">
        <p>Logged in as {user.username}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <h2>Workouts</h2>
      <div className="workout-groups">
        {sortedGroupedWorkouts.map(([exerciseName, exerciseWorkouts]) => (
          <div key={exerciseName} className="workout-group">
            <h3>{exerciseName}</h3>

            <ul>
              {exerciseWorkouts.map((workout) => (
                <li key={workout.id}>
                  <span className="workout-text">
                    {workout.weight}kg x {workout.reps}
                  </span>
                  <button onClick={() => handleDelete(workout.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;