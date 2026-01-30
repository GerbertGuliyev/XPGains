/**
 * Workout Screen
 * Select muscle → exercise → input weight/reps → log XP
 */

import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import {
  SKILLS,
  getExercisesBySkill,
  levelFromXp,
  SkillId,
  Exercise,
  kgToLbs,
  lbsToKg,
} from '@xpgains/core';

type Step = 'muscle' | 'exercise' | 'input';

export default function WorkoutScreen() {
  const { state, completeSet } = useGameStore();
  const [step, setStep] = useState<Step>('muscle');
  const [selectedMuscle, setSelectedMuscle] = useState<SkillId | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const displayUnit = state.settings.unit;
  const isLbs = displayUnit === 'lbs';

  // Handle muscle selection
  const handleMuscleSelect = (skillId: SkillId) => {
    setSelectedMuscle(skillId);
    setStep('exercise');
  };

  // Handle exercise selection
  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    // Set default weight
    const defaultKg = exercise.weight.default;
    setWeight(isLbs ? kgToLbs(defaultKg).toString() : defaultKg.toString());
    setReps('10');
    setStep('input');
  };

  // Handle back navigation
  const handleBack = () => {
    if (step === 'exercise') {
      setStep('muscle');
      setSelectedMuscle(null);
    } else if (step === 'input') {
      setStep('exercise');
      setSelectedExercise(null);
    }
  };

  // Handle set completion
  const handleComplete = () => {
    if (!selectedExercise || !weight || !reps) {
      Alert.alert('Missing Input', 'Please enter weight and reps');
      return;
    }

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);

    if (isNaN(weightNum) || isNaN(repsNum) || repsNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid weight and reps');
      return;
    }

    // Convert to kg if needed
    const weightKg = isLbs ? lbsToKg(weightNum) : weightNum;

    completeSet(selectedExercise.id, {
      exerciseId: selectedExercise.id,
      reps: repsNum,
      weightKg,
    });

    Alert.alert('Set Logged!', `+XP awarded to ${selectedMuscle}`, [
      {
        text: 'Log Another Set',
        onPress: () => {
          // Stay on input screen for another set
        },
      },
      {
        text: 'Done',
        onPress: () => {
          setStep('muscle');
          setSelectedMuscle(null);
          setSelectedExercise(null);
          setWeight('');
          setReps('');
        },
      },
    ]);
  };

  // Render muscle selection
  if (step === 'muscle') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Select a Muscle</Text>
        <Text style={styles.subtitle}>Choose which muscle group to train</Text>

        <View style={styles.muscleGrid}>
          {SKILLS.map(skill => {
            const xp = state.stats.skillXp[skill.id] || 0;
            const level = levelFromXp(xp);

            return (
              <Pressable
                key={skill.id}
                style={styles.muscleCard}
                onPress={() => handleMuscleSelect(skill.id)}
              >
                <Text style={styles.muscleIcon}>{skill.name.charAt(0)}</Text>
                <Text style={styles.muscleName}>{skill.name}</Text>
                <Text style={styles.muscleLevel}>Lv. {level}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // Render exercise selection
  if (step === 'exercise' && selectedMuscle) {
    const exercises = getExercisesBySkill(selectedMuscle);
    const muscle = SKILLS.find(s => s.id === selectedMuscle);

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>{muscle?.name}</Text>
        <Text style={styles.subtitle}>Select an exercise</Text>

        <View style={styles.exerciseList}>
          {exercises.map(exercise => {
            const isFavorite = state.favorites[exercise.id];

            return (
              <Pressable
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => handleExerciseSelect(exercise)}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseType}>
                    {exercise.type === 'compound' ? 'Compound' : 'Isolation'}
                  </Text>
                </View>
                {isFavorite && <Text style={styles.favoriteIcon}>⭐</Text>}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // Render input screen
  if (step === 'input' && selectedExercise) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>{selectedExercise.name}</Text>
        <Text style={styles.subtitle}>Enter your set details</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight ({displayUnit})</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <Pressable style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Set</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#ff981f',
    fontSize: 16,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  muscleCard: {
    width: '48%',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  muscleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  muscleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  muscleLevel: {
    fontSize: 14,
    color: '#ff981f',
  },
  exerciseList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  exerciseType: {
    fontSize: 12,
    color: '#888',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  inputGroup: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  completeButton: {
    backgroundColor: '#ff981f',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
