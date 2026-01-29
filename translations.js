/**
 * XPGains Internationalization (i18n)
 * Contains all UI translations for 15 supported languages
 */

const I18N = {
  // Supported languages
  languages: [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'sv', name: 'Svenska' }
  ],

  // RTL languages
  rtlLanguages: ['ar'],

  // Translations dictionary
  translations: {
    en: {
      // Navigation
      'nav.muscle_map': 'Muscle Map',
      'nav.stats_card': 'Stats Card',
      'nav.log': 'Log',
      'nav.challenges': 'Challenges',
      'nav.friends': 'Friends',
      'nav.settings': 'Settings',

      // Muscle Map Screen
      'muscle_map.title': 'Muscle Map',
      'muscle_map.subtitle': 'Select a muscle to train and begin leveling up',
      'muscle_map.create_plan': 'Create Training Plan',
      'muscle_map.add_custom_exercise': 'Add Custom Exercise',
      'muscle_map.statistics': 'Statistics',
      'muscle_map.front': 'Front',
      'muscle_map.back': 'Back',

      // Custom Exercise
      'custom.title': 'Add Custom Exercise',
      'custom.name': 'Exercise Name',
      'custom.name_placeholder': 'e.g., Cable Fly',
      'custom.target_muscle': 'Target Muscle',
      'custom.exercise_type': 'Exercise Type',
      'custom.weight_range': 'Weight Range',
      'custom.weight_light': 'Light (0-30)',
      'custom.weight_medium': 'Medium (0-60)',
      'custom.weight_heavy': 'Heavy (0-120)',
      'custom.weight_custom': 'Custom Range',
      'custom.weight_min': 'Min Weight',
      'custom.weight_max': 'Max Weight',
      'custom.xp_mode': 'XP Mode',
      'custom.xp_standard': 'Standard (auto-calculated)',
      'custom.xp_custom': 'Custom XP per set',
      'custom.xp_per_set': 'XP per Set',
      'custom.created': 'created',

      // Stats Card Screen
      'stats_card.title': 'Stats Card',
      'stats_card.total_level': 'Total Level',

      // Training Flow
      'training.select_exercise': 'Select an exercise',
      'training.weight': 'Weight',
      'training.reps': 'Reps',
      'training.helper_text': 'Complete a set, then press XP Tick to log it.',
      'training.xp_tick': 'XP Tick',
      'training.back': 'Back',
      'training.level_up': 'Level up! {skill} is now level {level}!',

      // Log Screen
      'log.title': 'Training Log',
      'log.empty': 'Your log is currently empty. XP gained from performing sets will be shown here.',
      'log.undo': 'Undo',
      'log.undo_confirm': 'Undo this set? This will subtract {xp} XP from {skill}.',
      'log.weight_up': 'Weight up',
      'log.reps_up': 'Reps up',
      'log.spillover': '+{xp} XP {skill}',

      // Challenges Screen
      'challenges.title': 'Challenges',
      'challenges.workout_quest': 'Workout Quest',
      'challenges.body_focus': 'Body Focus',
      'challenges.full_random': 'Full Random',
      'challenges.upper_body': 'Upper Body',
      'challenges.lower_body': 'Lower Body',
      'challenges.workout_length': 'Workout Length',
      'challenges.short': 'Short',
      'challenges.regular': 'Regular',
      'challenges.ironman': 'Ironman',
      'challenges.short_desc': '1 muscle, 1 exercise, 4 sets',
      'challenges.regular_desc': '2 muscles, 3 exercises each, 3-4 sets per exercise',
      'challenges.ironman_desc': '3 muscles, 4 exercises each, 4 sets per exercise',
      'challenges.start': 'Start Workout Challenge',
      'challenges.active_quest': 'Active Quest',
      'challenges.sets_completed': '{completed} / {total} sets completed',
      'challenges.abandon': 'Abandon Quest',
      'challenges.abandon_confirm': 'Abandon this quest? Progress will be lost.',
      'challenges.complete': 'Complete Quest!',
      'challenges.completed_msg': 'Quest completed! Great workout!',

      // Friends Screen
      'friends.title': 'Friends',
      'friends.search_placeholder': 'Search by name...',
      'friends.share_progress': 'Share Progress',
      'friends.no_friends': 'No friends found.',
      'friends.get_started': 'Share your progress or add friends to get started!',
      'friends.viewing': 'Viewing: {name}',
      'friends.last_updated': 'Last updated: {date}',
      'friends.share_prompt': 'Enter a name to share your progress under:',
      'friends.invalid_name': 'Please enter a valid name.',
      'friends.share_success': 'Your progress has been saved under "{name}".',
      'friends.prev': 'Prev',
      'friends.next': 'Next',
      'friends.page_info': 'Page {current} of {total}',

      // Settings Screen
      'settings.title': 'Settings',
      'settings.units': 'Units',
      'settings.weight_unit': 'Weight Unit',
      'settings.language': 'Language',
      'settings.apply_language': 'Apply',
      'settings.theme': 'Theme',
      'settings.theme_classic': 'Classic',
      'settings.theme_alt': 'Mithril',
      'settings.calibration': 'Calibration',
      'settings.calibrate_skills': 'Calibrate Skills',
      'settings.calibrate_info': 'Manually set skill levels if you\'re migrating from another tracker.',
      'settings.equipment': 'Equipment',
      'settings.equipment_mode': 'Equipment Filtering',
      'settings.equipment_mode_desc': 'Only show exercises for equipment you have',
      'settings.select_equipment': 'Select Equipment',
      'settings.data': 'Data',
      'settings.reset_data': 'Reset All Data',
      'settings.reset_warning': 'This will delete all your progress and cannot be undone.',
      'settings.reset_confirm': 'Reset all XPGains data? This cannot be undone.',
      'settings.about': 'About',
      'settings.version': 'XPGains v0.07 - Track your progress\n© 2026 Gerbert Guliyev. All rights reserved.',

      // Calibration Modal
      'calibration.title': 'Calibrate Skills',
      'calibration.desc': 'Set skill levels manually. XP will be set to the minimum for each level.',
      'calibration.cancel': 'Cancel',
      'calibration.save': 'Save',

      // Skill Names
      'skill.chest': 'Chest',
      'skill.back_lats': 'Back – Lats',
      'skill.back_erector': 'Back – Lower',
      'skill.traps': 'Traps',
      'skill.neck': 'Neck',
      'skill.delts': 'Delts',
      'skill.biceps': 'Biceps',
      'skill.triceps': 'Triceps',
      'skill.forearms': 'Forearms',
      'skill.core': 'Core',
      'skill.glutes': 'Glutes',
      'skill.quads': 'Quads',
      'skill.hamstrings': 'Hamstrings',
      'skill.calves': 'Calves',

      // Intro Modal
      'intro.title': 'Welcome to XPGains!',
      'intro.subtitle': 'XPGains helps you track your workouts by turning each muscle into a levelable skill',
      'intro.step1': 'Select a muscle to train',
      'intro.step2': 'Earn XP by completing exercises',
      'intro.step3': 'Level up and track your progress',
      'intro.got_it': 'Get Started',

      // Statistics Modal
      'stats.title': 'Statistics',
      'stats.close': 'Close',
      'stats.no_data': 'Not enough data yet. Log some sets to see your stats!',
      'stats.radar_upper': 'Upper Body',
      'stats.radar_lower': 'Lower Body',
      'stats.radar_consistency': 'Consistency',
      'stats.radar_volume': 'Volume',
      'stats.radar_diversity': 'Diversity',
      'stats.radar_progression': 'Progression',
      'stats.muscle_changes': 'Muscle Changes (7 days)',
      'stats.no_change': 'No change',
      'stats.sets_week': 'sets this week',
      'stats.no_graph_data': 'No data yet for this muscle.',

      // Equipment
      'equipment.title': 'Select Your Equipment',
      'equipment.bench': 'Bench',
      'equipment.dumbbells': 'Dumbbells',
      'equipment.barbell': 'Barbell',
      'equipment.cable': 'Cable Machine',
      'equipment.pullup_bar': 'Pull-up Bar',
      'equipment.squat_rack': 'Squat Rack',
      'equipment.machines': 'Machines',
      'equipment.bands': 'Resistance Bands',
      'equipment.bodyweight': 'Bodyweight Only',
      'equipment.done': 'Done',

      // Training Plans
      'plans.title': 'Training Plans',
      'plans.create': 'Create New Plan',
      'plans.no_plans': 'You have not added any training plans yet.',
      'plans.create_first': 'Follow the next steps to create a custom workout.',
      'plans.name_placeholder': 'Plan name (e.g., Push Day)',
      'plans.add_exercise': 'Add Exercise',
      'plans.sets': 'Sets',
      'plans.save': 'Save Plan',
      'plans.cancel': 'Cancel',
      'plans.delete': 'Delete',
      'plans.delete_confirm': 'Delete this training plan?',
      'plans.run': 'Run Plan',
      'plans.edit': 'Edit',
      'plans.exercises_count': '{count} exercises',
      'plans.exercise_progress': 'Exercise {current} of {total}',
      'plans.set_progress': 'Set {done} / {target}',
      'plans.prev_exercise': 'Previous',
      'plans.next_exercise': 'Next',
      'plans.finish': 'Finish',
      'plans.exit_plan': 'Exit Plan',
      'plans.exit_confirm': 'Exit this plan? Progress will be lost.',
      'plans.skip_confirm': 'Skip exercise? Only {done}/{target} sets completed.',
      'plans.complete_title': 'Plan Complete!',
      'plans.total_sets': 'Total Sets',
      'plans.done': 'Done',
      'plans.resume_confirm': 'Resume "{name}" plan?',

      // Common
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.close': 'Close',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.done': 'Done',
      'common.ok': 'OK',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.on': 'On',
      'common.off': 'Off',
      'common.train': 'Train',
      'common.experience': 'Experience',
      'common.xp_to_level': '{xp} XP to level {level}',
      'common.max_level': 'MAX LEVEL'
    },

    // German
    de: {
      // Navigation
      'nav.muscle_map': 'Muskelkarte',
      'nav.stats_card': 'Statistiken',
      'nav.log': 'Protokoll',
      'nav.challenges': 'Herausforderungen',
      'nav.friends': 'Freunde',
      'nav.settings': 'Einstellungen',

      // Muscle Map Screen
      'muscle_map.title': 'Muskelkarte',
      'muscle_map.subtitle': 'Wähle einen Muskel und beginne zu leveln',
      'muscle_map.create_plan': 'Trainingsplan erstellen',
      'muscle_map.add_custom_exercise': 'Eigene Übung hinzufügen',
      'muscle_map.statistics': 'Statistiken',
      'muscle_map.front': 'Vorne',
      'muscle_map.back': 'Hinten',

      // Custom Exercise
      'custom.title': 'Eigene Übung hinzufügen',
      'custom.name': 'Übungsname',
      'custom.name_placeholder': 'z.B. Kabelzug Fly',
      'custom.target_muscle': 'Zielmuskel',
      'custom.exercise_type': 'Übungstyp',
      'custom.weight_range': 'Gewichtsbereich',
      'custom.weight_light': 'Leicht (0-30)',
      'custom.weight_medium': 'Mittel (0-60)',
      'custom.weight_heavy': 'Schwer (0-120)',
      'custom.weight_custom': 'Eigener Bereich',
      'custom.weight_min': 'Min. Gewicht',
      'custom.weight_max': 'Max. Gewicht',
      'custom.xp_mode': 'XP Modus',
      'custom.xp_standard': 'Standard (automatisch)',
      'custom.xp_custom': 'Eigene XP pro Satz',
      'custom.xp_per_set': 'XP pro Satz',
      'custom.created': 'erstellt',

      // Stats Card Screen
      'stats_card.title': 'Statistiken',
      'stats_card.total_level': 'Gesamtstufe',

      // Training Flow
      'training.select_exercise': 'Wähle eine Übung',
      'training.weight': 'Gewicht',
      'training.reps': 'Wiederholungen',
      'training.helper_text': 'Absolviere einen Satz und drücke XP Tick zum Protokollieren.',
      'training.xp_tick': 'XP Tick',
      'training.back': 'Zurück',
      'training.level_up': 'Level Up! {skill} ist jetzt Stufe {level}!',

      // Log Screen
      'log.title': 'Trainingsprotokoll',
      'log.empty': 'Dein Protokoll ist leer. XP aus deinen Sätzen wird hier angezeigt.',
      'log.undo': 'Rückgängig',
      'log.undo_confirm': 'Diesen Satz rückgängig machen? {xp} XP werden von {skill} abgezogen.',
      'log.spillover': '+{xp} XP {skill}',

      // Challenges Screen
      'challenges.title': 'Herausforderungen',
      'challenges.workout_quest': 'Workout Quest',
      'challenges.body_focus': 'Körperfokus',
      'challenges.full_random': 'Komplett Zufällig',
      'challenges.upper_body': 'Oberkörper',
      'challenges.lower_body': 'Unterkörper',
      'challenges.workout_length': 'Trainingslänge',
      'challenges.short': 'Kurz',
      'challenges.regular': 'Normal',
      'challenges.ironman': 'Ironman',
      'challenges.short_desc': '1 Muskel, 1 Übung, 4 Sätze',
      'challenges.regular_desc': '2 Muskeln, 3 Übungen je, 3-4 Sätze pro Übung',
      'challenges.ironman_desc': '3 Muskeln, 4 Übungen je, 4 Sätze pro Übung',
      'challenges.start': 'Workout-Challenge starten',
      'challenges.active_quest': 'Aktive Quest',
      'challenges.sets_completed': '{completed} / {total} Sätze abgeschlossen',
      'challenges.abandon': 'Quest abbrechen',
      'challenges.abandon_confirm': 'Diese Quest abbrechen? Fortschritt geht verloren.',
      'challenges.complete': 'Quest abschließen!',
      'challenges.completed_msg': 'Quest abgeschlossen! Tolles Training!',

      // Friends Screen
      'friends.title': 'Freunde',
      'friends.search_placeholder': 'Nach Namen suchen...',
      'friends.share_progress': 'Fortschritt teilen',
      'friends.no_friends': 'Keine Freunde gefunden.',
      'friends.get_started': 'Teile deinen Fortschritt oder füge Freunde hinzu!',

      // Settings Screen
      'settings.title': 'Einstellungen',
      'settings.units': 'Einheiten',
      'settings.weight_unit': 'Gewichtseinheit',
      'settings.language': 'Sprache',
      'settings.apply_language': 'Anwenden',
      'settings.theme': 'Design',
      'settings.theme_classic': 'Classic',
      'settings.theme_alt': 'Mithril',
      'settings.calibration': 'Kalibrierung',
      'settings.calibrate_skills': 'Skills kalibrieren',
      'settings.calibrate_info': 'Setze Skill-Stufen manuell, wenn du von einem anderen Tracker wechselst.',
      'settings.equipment': 'Ausrüstung',
      'settings.equipment_mode': 'Ausrüstungsfilter',
      'settings.equipment_mode_desc': 'Zeige nur Übungen für verfügbare Ausrüstung',
      'settings.select_equipment': 'Ausrüstung wählen',
      'settings.data': 'Daten',
      'settings.reset_data': 'Alle Daten zurücksetzen',
      'settings.reset_warning': 'Dies löscht deinen gesamten Fortschritt unwiderruflich.',
      'settings.reset_confirm': 'Alle XPGains-Daten zurücksetzen? Dies kann nicht rückgängig gemacht werden.',
      'settings.about': 'Über',
      'settings.version': 'XPGains v0.07 - Track your progress\n© 2026 Gerbert Guliyev. All rights reserved.',

      // Calibration Modal
      'calibration.title': 'Skills kalibrieren',
      'calibration.desc': 'Setze Skill-Stufen manuell. XP wird auf das Minimum für jede Stufe gesetzt.',
      'calibration.cancel': 'Abbrechen',
      'calibration.save': 'Speichern',

      // Skill Names
      'skill.chest': 'Brust',
      'skill.back_lats': 'Rücken – Latissimus',
      'skill.back_erector': 'Rücken – Unterer',
      'skill.traps': 'Trapez',
      'skill.neck': 'Nacken',
      'skill.delts': 'Schultern',
      'skill.biceps': 'Bizeps',
      'skill.triceps': 'Trizeps',
      'skill.forearms': 'Unterarme',
      'skill.core': 'Rumpf',
      'skill.glutes': 'Gesäß',
      'skill.quads': 'Quadrizeps',
      'skill.hamstrings': 'Beinbeuger',
      'skill.calves': 'Waden',

      // Intro Modal
      'intro.title': 'Willkommen bei XPGains!',
      'intro.subtitle': 'XPGains hilft dir, deine Workouts zu verfolgen, indem jeder Muskel zu einem levelbaren Skill wird',
      'intro.step1': 'Wähle einen Muskel zum Trainieren',
      'intro.step2': 'Verdiene XP durch abgeschlossene Übungen',
      'intro.step3': 'Steige auf und verfolge deinen Fortschritt',
      'intro.got_it': 'Los geht\'s',

      // Statistics Modal
      'stats.title': 'Statistiken',
      'stats.close': 'Schließen',
      'stats.no_data': 'Noch nicht genug Daten. Protokolliere Sätze um Statistiken zu sehen!',
      'stats.muscle_changes': 'Muskelveränderungen (7 Tage)',
      'stats.no_change': 'Keine Änderung',
      'stats.sets_week': 'Sätze diese Woche',
      'stats.no_graph_data': 'Noch keine Daten für diesen Muskel.',

      // Equipment
      'equipment.title': 'Wähle deine Ausrüstung',
      'equipment.bench': 'Bank',
      'equipment.dumbbells': 'Kurzhanteln',
      'equipment.barbell': 'Langhantel',
      'equipment.cable': 'Kabelzug',
      'equipment.pullup_bar': 'Klimmzugstange',
      'equipment.squat_rack': 'Kniebeuge-Rack',
      'equipment.machines': 'Maschinen',
      'equipment.bands': 'Widerstandsbänder',
      'equipment.bodyweight': 'Nur Körpergewicht',
      'equipment.done': 'Fertig',

      // Training Plans
      'plans.title': 'Trainingspläne',
      'plans.create': 'Neuen Plan erstellen',
      'plans.no_plans': 'Du hast noch keine Trainingspläne erstellt.',
      'plans.create_first': 'Folge den nächsten Schritten, um ein Training zu erstellen.',
      'plans.name_placeholder': 'Planname (z.B. Push-Tag)',
      'plans.add_exercise': 'Übung hinzufügen',
      'plans.sets': 'Sätze',
      'plans.save': 'Plan speichern',
      'plans.cancel': 'Abbrechen',
      'plans.delete': 'Löschen',
      'plans.delete_confirm': 'Diesen Trainingsplan löschen?',
      'plans.run': 'Plan starten',
      'plans.edit': 'Bearbeiten',
      'plans.exercises_count': '{count} Übungen',
      'plans.exercise_progress': 'Übung {current} von {total}',
      'plans.set_progress': 'Satz {done} / {target}',
      'plans.prev_exercise': 'Zurück',
      'plans.next_exercise': 'Weiter',
      'plans.finish': 'Beenden',
      'plans.exit_plan': 'Plan verlassen',
      'plans.exit_confirm': 'Plan verlassen? Fortschritt geht verloren.',
      'plans.skip_confirm': 'Übung überspringen? Nur {done}/{target} Sätze erledigt.',
      'plans.complete_title': 'Plan abgeschlossen!',
      'plans.total_sets': 'Gesamte Sätze',
      'plans.done': 'Fertig',
      'plans.resume_confirm': 'Plan "{name}" fortsetzen?',

      // Common
      'common.cancel': 'Abbrechen',
      'common.save': 'Speichern',
      'common.delete': 'Löschen',
      'common.close': 'Schließen',
      'common.back': 'Zurück',
      'common.next': 'Weiter',
      'common.done': 'Fertig',
      'common.ok': 'OK',
      'common.yes': 'Ja',
      'common.no': 'Nein',
      'common.on': 'An',
      'common.off': 'Aus',
      'common.train': 'Trainieren',
      'common.experience': 'Erfahrung',
      'common.xp_to_level': '{xp} XP bis Stufe {level}',
      'common.max_level': 'MAX STUFE'
    },

    // French
    fr: {},

    // Spanish
    es: {},

    // Italian
    it: {},

    // Portuguese
    pt: {},

    // Dutch
    nl: {},

    // Polish
    pl: {},

    // Russian
    ru: {
      // Navigation
      'nav.muscle_map': 'Обзор Мышц',
      'nav.stats_card': 'Характеристики',
      'nav.log': 'Журнал',
      'nav.challenges': 'Задачи',
      'nav.friends': 'Друзья',
      'nav.settings': 'Настройки',

      // Muscle Map Screen
      'muscle_map.title': 'Обзор Мышц',
      'muscle_map.subtitle': 'Выберите мышцу и начните прокачку',
      'muscle_map.create_plan': 'Создать план тренировки',
      'muscle_map.add_custom_exercise': 'Добавить своё упражнение',
      'muscle_map.statistics': 'Статистика',
      'muscle_map.front': 'Спереди',
      'muscle_map.back': 'Сзади',

      // Custom Exercise
      'custom.title': 'Добавить своё упражнение',
      'custom.name': 'Название упражнения',
      'custom.name_placeholder': 'напр., Кроссовер',
      'custom.target_muscle': 'Целевая мышца',
      'custom.exercise_type': 'Тип упражнения',
      'custom.weight_range': 'Диапазон веса',
      'custom.weight_light': 'Лёгкий (0-30)',
      'custom.weight_medium': 'Средний (0-60)',
      'custom.weight_heavy': 'Тяжёлый (0-120)',
      'custom.weight_custom': 'Свой диапазон',
      'custom.weight_min': 'Мин. вес',
      'custom.weight_max': 'Макс. вес',
      'custom.xp_mode': 'Режим XP',
      'custom.xp_standard': 'Стандартный (авто)',
      'custom.xp_custom': 'Свой XP за подход',
      'custom.xp_per_set': 'XP за подход',
      'custom.created': 'создано',

      // Stats Card Screen
      'stats_card.title': 'Характеристики',
      'stats_card.total_level': 'Общий уровень',

      // Training Flow
      'training.select_exercise': 'Выберите упражнение',
      'training.weight': 'Вес',
      'training.reps': 'Повторения',
      'training.helper_text': 'Выполните подход и нажмите XP Tick для записи.',
      'training.xp_tick': 'XP Tick',
      'training.back': 'Назад',
      'training.level_up': 'Повышение уровня! {skill} теперь уровень {level}!',

      // Log Screen
      'log.title': 'Журнал тренировок',
      'log.empty': 'Журнал пуст. XP, полученный за выполнение подходов, будет отображаться здесь.',
      'log.undo': 'Отменить',
      'log.undo_confirm': 'Отменить этот подход? {xp} XP будет вычтено из {skill}.',
      'log.spillover': '+{xp} XP {skill}',

      // Challenges Screen
      'challenges.title': 'Задачи',
      'challenges.workout_quest': 'Квест тренировки',
      'challenges.body_focus': 'Фокус на теле',
      'challenges.full_random': 'Полностью случайно',
      'challenges.upper_body': 'Верх тела',
      'challenges.lower_body': 'Низ тела',
      'challenges.workout_length': 'Длительность тренировки',
      'challenges.short': 'Короткая',
      'challenges.regular': 'Обычная',
      'challenges.ironman': 'Железный человек',
      'challenges.short_desc': '1 мышца, 1 упражнение, 4 подхода',
      'challenges.regular_desc': '2 мышцы, 3 упражнения каждая, 3-4 подхода',
      'challenges.ironman_desc': '3 мышцы, 4 упражнения каждая, 4 подхода',
      'challenges.start': 'Начать задачу',
      'challenges.active_quest': 'Активный квест',
      'challenges.sets_completed': '{completed} / {total} подходов выполнено',
      'challenges.abandon': 'Отменить квест',
      'challenges.abandon_confirm': 'Отменить этот квест? Прогресс будет потерян.',
      'challenges.complete': 'Завершить квест!',
      'challenges.completed_msg': 'Квест завершён! Отличная тренировка!',

      // Friends Screen
      'friends.title': 'Друзья',
      'friends.search_placeholder': 'Поиск по имени...',
      'friends.share_progress': 'Поделиться прогрессом',
      'friends.no_friends': 'Друзья не найдены.',
      'friends.get_started': 'Поделитесь прогрессом или добавьте друзей!',

      // Settings Screen
      'settings.title': 'Настройки',
      'settings.units': 'Единицы',
      'settings.weight_unit': 'Единица веса',
      'settings.language': 'Язык',
      'settings.apply_language': 'Применить',
      'settings.theme': 'Тема',
      'settings.theme_classic': 'Classic',
      'settings.theme_alt': 'Mithril',
      'settings.calibration': 'Калибровка',
      'settings.calibrate_skills': 'Калибровать навыки',
      'settings.calibrate_info': 'Установите уровни навыков вручную при переходе с другого трекера.',
      'settings.equipment': 'Оборудование',
      'settings.equipment_mode': 'Фильтр оборудования',
      'settings.equipment_mode_desc': 'Показывать только упражнения для доступного оборудования',
      'settings.select_equipment': 'Выбрать оборудование',
      'settings.data': 'Данные',
      'settings.reset_data': 'Сбросить все данные',
      'settings.reset_warning': 'Это удалит весь ваш прогресс без возможности восстановления.',
      'settings.reset_confirm': 'Сбросить все данные XPGains? Это нельзя отменить.',
      'settings.about': 'О приложении',
      'settings.version': 'XPGains v0.07 - Track your progress\n© 2026 Gerbert Guliyev. All rights reserved.',

      // Calibration Modal
      'calibration.title': 'Калибровка навыков',
      'calibration.desc': 'Установите уровни навыков вручную. XP будет установлен на минимум для каждого уровня.',
      'calibration.cancel': 'Отмена',
      'calibration.save': 'Сохранить',

      // Skill Names
      'skill.chest': 'Грудь',
      'skill.back_lats': 'Спина – Широчайшие',
      'skill.back_erector': 'Спина – Нижняя',
      'skill.traps': 'Трапеции',
      'skill.neck': 'Шея',
      'skill.delts': 'Дельты',
      'skill.biceps': 'Бицепс',
      'skill.triceps': 'Трицепс',
      'skill.forearms': 'Предплечья',
      'skill.core': 'Кор',
      'skill.glutes': 'Ягодицы',
      'skill.quads': 'Квадрицепс',
      'skill.hamstrings': 'Бицепс бедра',
      'skill.calves': 'Икры',

      // Intro Modal
      'intro.title': 'Добро пожаловать в XPGains!',
      'intro.subtitle': 'XPGains помогает отслеживать тренировки, превращая каждую мышцу в прокачиваемый навык',
      'intro.step1': 'Выберите мышцу для тренировки',
      'intro.step2': 'Зарабатывайте XP за выполнение упражнений',
      'intro.step3': 'Повышайте уровень и отслеживайте прогресс',
      'intro.got_it': 'Начать',

      // Statistics Modal
      'stats.title': 'Статистика',
      'stats.close': 'Закрыть',
      'stats.no_data': 'Недостаточно данных. Запишите подходы чтобы увидеть статистику!',
      'stats.muscle_changes': 'Изменения мышц (7 дней)',
      'stats.no_change': 'Без изменений',
      'stats.sets_week': 'подходов за неделю',
      'stats.no_graph_data': 'Нет данных для этой мышцы.',

      // Equipment
      'equipment.title': 'Выберите оборудование',
      'equipment.bench': 'Скамья',
      'equipment.dumbbells': 'Гантели',
      'equipment.barbell': 'Штанга',
      'equipment.cable': 'Тросовый тренажёр',
      'equipment.pullup_bar': 'Турник',
      'equipment.squat_rack': 'Стойка для приседаний',
      'equipment.machines': 'Тренажёры',
      'equipment.bands': 'Резинки',
      'equipment.bodyweight': 'Только своё тело',
      'equipment.done': 'Готово',

      // Training Plans
      'plans.title': 'Планы тренировок',
      'plans.create': 'Создать новый план',
      'plans.no_plans': 'У вас пока нет планов тренировок.',
      'plans.create_first': 'Следуйте инструкциям, чтобы создать свою тренировку.',
      'plans.name_placeholder': 'Название плана (напр., День жима)',
      'plans.add_exercise': 'Добавить упражнение',
      'plans.sets': 'Подходы',
      'plans.save': 'Сохранить план',
      'plans.cancel': 'Отмена',
      'plans.delete': 'Удалить',
      'plans.delete_confirm': 'Удалить этот план тренировки?',
      'plans.run': 'Запустить план',
      'plans.edit': 'Изменить',
      'plans.exercises_count': '{count} упражнений',
      'plans.exercise_progress': 'Упражнение {current} из {total}',
      'plans.set_progress': 'Подход {done} / {target}',
      'plans.prev_exercise': 'Назад',
      'plans.next_exercise': 'Далее',
      'plans.finish': 'Завершить',
      'plans.exit_plan': 'Выйти из плана',
      'plans.exit_confirm': 'Выйти из плана? Прогресс будет потерян.',
      'plans.skip_confirm': 'Пропустить упражнение? Выполнено только {done}/{target} подходов.',
      'plans.complete_title': 'План завершён!',
      'plans.total_sets': 'Всего подходов',
      'plans.done': 'Готово',
      'plans.resume_confirm': 'Продолжить план "{name}"?',

      // Common
      'common.cancel': 'Отмена',
      'common.save': 'Сохранить',
      'common.delete': 'Удалить',
      'common.close': 'Закрыть',
      'common.back': 'Назад',
      'common.next': 'Далее',
      'common.done': 'Готово',
      'common.ok': 'ОК',
      'common.yes': 'Да',
      'common.no': 'Нет',
      'common.on': 'Вкл',
      'common.off': 'Выкл',
      'common.train': 'Тренировать',
      'common.experience': 'Опыт',
      'common.xp_to_level': '{xp} XP до уровня {level}',
      'common.max_level': 'МАКС УРОВЕНЬ'
    },

    // Japanese
    ja: {},

    // Korean
    ko: {},

    // Chinese
    zh: {},

    // Arabic
    ar: {},

    // Turkish
    tr: {},

    // Swedish
    sv: {}
  }
};
