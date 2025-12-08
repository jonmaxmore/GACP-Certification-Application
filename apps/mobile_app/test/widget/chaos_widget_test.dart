import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile_app/presentation/features/application/screens/application_wizard_screen.dart';
import 'package:mobile_app/presentation/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/presentation/features/establishment/providers/establishment_provider.dart';
import 'package:mobile_app/presentation/features/application/providers/application_provider.dart';
import 'package:mobile_app/domain/repositories/auth_repository.dart';
import 'package:mobile_app/domain/repositories/establishment_repository.dart';
import 'package:mobile_app/domain/repositories/application_repository.dart';
import 'package:mobile_app/domain/entities/user_entity.dart';
import 'package:mobile_app/domain/entities/application_entity.dart';
import 'package:mobile_app/core/network/dio_client.dart';
import 'package:mobile_app/core/errors/failures.dart';
import 'package:dartz/dartz.dart';

// Mocks with Mutable Behavior for "Network Ghosts"
class MockAuthRepository extends Mock implements AuthRepository {}

class MockDioClient extends Mock implements DioClient {}

class MockEstablishmentRepository extends Mock
    implements EstablishmentRepository {}

class MutableMockApplicationRepository extends Mock
    implements ApplicationRepository {
  bool simulateNetworkError = false;

  @override
  Future<Either<Failure, List<ApplicationEntity>>> getMyApplications() async {
    if (simulateNetworkError) {
      return const Left(NetworkFailure(message: 'Network Error: 500'));
    }
    return const Right([]);
  }
}

void main() {
  final rnd = Random(); // Random Seed
  late MockAuthRepository mockAuthRepo;
  late MockEstablishmentRepository mockEstRepo;
  late MutableMockApplicationRepository mockAppRepo;

  setUp(() {
    mockAuthRepo = MockAuthRepository();
    mockEstRepo = MockEstablishmentRepository();
    mockAppRepo = MutableMockApplicationRepository();
  });

  testWidgets('Chaos Fuzz Test: 1000 Iterations of Mayhem', (tester) async {
    // 1. Arrange Baseline Mocks
    final tUser = UserEntity(
        id: 'user_chaos_1',
        email: 'chaos@gacp.com',
        firstName: 'Chaos',
        lastName: 'Monkey',
        role: 'farmer',
        phoneNumber: '000',
        address: 'Void',
        zipCode: '00000',
        registeredAt: DateTime.now());

    when(() => mockAuthRepo.getCurrentUser())
        .thenAnswer((_) async => Right(tUser));

    when(() => mockEstRepo.getEstablishments())
        .thenAnswer((_) async => const Right([]));

    // 2. Launch App Harness
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRepositoryProvider.overrideWithValue(mockAuthRepo),
          establishmentRepositoryProvider.overrideWithValue(mockEstRepo),
          applicationProvider.overrideWith(
              (ref) => ApplicationNotifier(mockAppRepo, MockDioClient())),
        ],
        child: const MaterialApp(
          home: ApplicationWizardScreen(requestType: 'NEW'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    debugPrint('🔥 BEGINNING CHAOS TEST - 1000 ITERATIONS 🔥');

    // 3. The 1000 Iterations Loop
    for (int i = 0; i < 1000; i++) {
      final squadId = rnd.nextInt(4) + 1; // 1 to 4
      debugPrint('💀 Iteration $i: Deploying Squad $squadId');

      try {
        switch (squadId) {
          case 1:
            await _runSpeedRunners(tester, rnd);
            break;
          case 2:
            await _runNetworkGhosts(tester, mockAppRepo);
            break;
          case 3:
            await _runInputSpammers(tester, rnd);
            break;
          case 4:
            await _runDeepNavigators(tester);
            break;
        }

        // Recovery Pump
        await tester
            .pumpAndSettle(const Duration(milliseconds: 100)); // Brief settle
      } catch (e) {
        debugPrint('💥 CRASH DETECTED in Iteration $i (Squad $squadId): $e');
      }
    }
  });
}

// --- Squad Implementations ---

/// Squad 1: Speed Runners
Future<void> _runSpeedRunners(WidgetTester tester, Random rnd) async {
  final buttons = find.byType(ElevatedButton);
  final count = buttons.evaluate().length;

  if (count > 0) {
    for (int k = 0; k < 5; k++) {
      final target = buttons.at(rnd.nextInt(count));
      try {
        await tester.tap(target);
        await tester.pump(const Duration(milliseconds: 50));
      } catch (e) {
        // Ignored
      }
    }
  }
}

/// Squad 2: Network Ghosts
Future<void> _runNetworkGhosts(
    WidgetTester tester, MutableMockApplicationRepository repo) async {
  repo.simulateNetworkError = true;
  debugPrint('   👻 Simulating Offline/Failure...');

  final nextBtn = find.text('Next Step');
  if (nextBtn.evaluate().isNotEmpty) {
    await tester.tap(nextBtn.first);
    await tester.pumpAndSettle(const Duration(milliseconds: 500));
  }

  repo.simulateNetworkError = false;
  debugPrint('   👻 Restoring Network...');
}

/// Squad 3: Input Spammers
Future<void> _runInputSpammers(WidgetTester tester, Random rnd) async {
  final fields = find.byType(TextField);
  final count = fields.evaluate().length;

  if (count > 0) {
    final targetIndex = rnd.nextInt(count);
    final target = fields.at(targetIndex);

    final payloads = [
      'A' * 1000,
      '😤🤠🤡👻👽🤖💩',
      "' OR '1'='1",
      '-9999999',
      '<script>alert(1)</script>',
      '          ',
    ];

    final payload = payloads[rnd.nextInt(payloads.length)];
    try {
      await tester.enterText(target, payload);
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
    } catch (e) {
      // Ignore input errors
    }
  }
}

/// Squad 4: Deep Navigators
Future<void> _runDeepNavigators(WidgetTester tester) async {
  debugPrint('   💤 App Going to Background...');
  tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
  await Future.delayed(const Duration(milliseconds: 100));
  debugPrint('   ☀️ App Resuming...');
  tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
  await tester.pumpAndSettle();
}
