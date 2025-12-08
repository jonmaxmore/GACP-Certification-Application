import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:hive_flutter/hive_flutter.dart';

class ApplicationFormState {
  final int currentStep;
  final Map<String, dynamic> formData;
  final Map<String, PlatformFile> attachedFiles;
  final bool isLoading;
  final String? error;

  ApplicationFormState({
    this.currentStep = 0,
    this.formData = const {},
    this.attachedFiles = const {},
    this.isLoading = false,
    this.error,
  });

  ApplicationFormState copyWith({
    int? currentStep,
    Map<String, dynamic>? formData,
    Map<String, PlatformFile>? attachedFiles,
    bool? isLoading,
    String? error,
  }) {
    return ApplicationFormState(
      currentStep: currentStep ?? this.currentStep,
      formData: formData ?? this.formData,
      attachedFiles: attachedFiles ?? this.attachedFiles,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    ); // Clear error on state change unless explicitly set? No, safer to keep unless cleared.
  }
}

class ApplicationFormNotifier extends StateNotifier<ApplicationFormState> {
  ApplicationFormNotifier() : super(ApplicationFormState());

  void setStep(int step) {
    state = state.copyWith(currentStep: step);
  }

  void nextStep() {
    state = state.copyWith(currentStep: state.currentStep + 1);
  }

  void prevStep() {
    if (state.currentStep > 0) {
      state = state.copyWith(currentStep: state.currentStep - 1);
    }
  }

  void updateFormData(String key, dynamic value) {
    final newData = Map<String, dynamic>.from(state.formData);
    newData[key] = value;
    state = state.copyWith(formData: newData);
  }

  void updateEntireForm(Map<String, dynamic> data) {
    final newData = Map<String, dynamic>.from(state.formData)..addAll(data);
    state = state.copyWith(formData: newData);
  }

  void addFile(String key, PlatformFile file) {
    final newFiles = Map<String, PlatformFile>.from(state.attachedFiles);
    newFiles[key] = file;
    state = state.copyWith(attachedFiles: newFiles);
  }

  void removeFile(String key) {
    final newFiles = Map<String, PlatformFile>.from(state.attachedFiles);
    newFiles.remove(key);
    state = state.copyWith(attachedFiles: newFiles);
  }

  void setError(String message) {
    state = state.copyWith(error: message);
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  // Save Draft to Hive
  Future<void> saveDraft() async {
    try {
      final box = Hive.box('application_drafts');
      // Convert map to standard Map<String, dynamic> if needed,
      // but Hive handles basic types well.
      // We exclude attachedFiles (runtime PlatformFile) from draft for now
      // as they need re-picking or temporary caching which is complex.
      // We only save text form data.
      await box.put('current_draft', state.formData);
      state = state.copyWith(error: null); // Clear error on save
      // Notify user? State doesn't have "success message", maybe handled by UI awaiting this Future.
    } catch (e) {
      state = state.copyWith(error: 'Failed to save draft: $e');
    }
  }

  // Load Draft from Hive
  Future<bool> loadDraft() async {
    try {
      final box = Hive.box('application_drafts');
      final draftData = box.get('current_draft');
      if (draftData != null && draftData is Map) {
        // Safe cast
        final Map<String, dynamic> loadedData =
            Map<String, dynamic>.from(draftData);
        state = state.copyWith(formData: loadedData);
        return true;
      }
      return false;
    } catch (e) {
      state = state.copyWith(error: 'Failed to load draft: $e');
      return false;
    }
  }

  // Clear Draft
  Future<void> clearDraft() async {
    final box = Hive.box('application_drafts');
    await box.delete('current_draft');
  }

  // Check if draft exists
  bool get hasDraft {
    final box = Hive.box('application_drafts');
    return box.containsKey('current_draft');
  }

  // Convert PlatformFiles to XFiles for the ApplicationRepository
  Map<String, XFile> getXFiles() {
    return state.attachedFiles.map((key, file) {
      if (file.path != null) {
        return MapEntry(key, XFile(file.path!, name: file.name));
      }
      // For web, we might need bytes, but XFile supports bytes too.
      // Assuming mobile primarily for now based on file.path check.
      // If bytes are present (Web):
      if (file.bytes != null) {
        return MapEntry(key, XFile.fromData(file.bytes!, name: file.name));
      }
      throw Exception('File has no path or bytes: ${file.name}');
    });
  }
}

final applicationFormProvider = StateNotifierProvider.autoDispose<
    ApplicationFormNotifier, ApplicationFormState>((ref) {
  return ApplicationFormNotifier();
});
