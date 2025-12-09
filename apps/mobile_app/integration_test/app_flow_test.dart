import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile_app/presentation/features/application/screens/application_wizard_screen.dart';
import 'package:mobile_app/domain/entities/establishment_entity.dart';
import 'package:mobile_app/presentation/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/presentation/features/establishment/providers/establishment_provider.dart';
// Ensure correct path
import 'package:mobile_app/domain/repositories/auth_repository.dart';
import 'package:mobile_app/domain/repositories/establishment_repository.dart';
import 'package:mobile_app/domain/repositories/application_repository.dart';
import 'package:mobile_app/domain/entities/user_entity.dart';
import 'package:dartz/dartz.dart';

// Mocks
class MockAuthRepository extends Mock implements AuthRepository {}

class MockEstablishmentRepository extends Mock
    implements EstablishmentRepository {}

class MockApplicationRepository extends Mock implements ApplicationRepository {}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  late MockAuthRepository mockAuthRepo;
  late MockEstablishmentRepository mockEstRepo;
  late MockApplicationRepository mockAppRepo;

  setUp(() {
    mockAuthRepo = MockAuthRepository();
    mockEstRepo = MockEstablishmentRepository();
    mockAppRepo = MockApplicationRepository();
  });

  testWidgets('Golden Loop: Wizard Flow Verification', (tester) async {
    // 1. Arrange Mocks
    final tUser = UserEntity(
        id: 'u1',
        email: 'test@gacp.com',
        firstName: 'Tester',
        lastName: 'Apple',
        role: 'farmer',
        phoneNumber: '000',
        address: 'Cupertino',
        zipCode: '95014',
        registeredAt: DateTime.now());

    // Establishments
    const tEst = EstablishmentEntity(
      id: 'e1',
      name: 'Apple Farm',
      address: 'Cupertino, California',
      type: 'Indoor',
      status: 'Active',
    );

    when(() => mockEstRepo.getEstablishments())
        .thenAnswer((_) async => Right([tEst]));

    // 2. Launch App with ApplicationWizardScreen
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRepositoryProvider.overrideWithValue(mockAuthRepo),
          establishmentRepositoryProvider.overrideWithValue(mockEstRepo),
          // applicationRepositoryProvider.overrideWithValue(mockAppRepo), // If needed
        ],
        child: const MaterialApp(
          home: ApplicationWizardScreen(requestType: 'NEW'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // 3. Step 1: Info
    expect(find.text('Select Establishment'), findsOneWidget);
    await tester.tap(find.byType(DropdownButtonFormField<String>));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Apple Farm').last);
    await tester.pumpAndSettle();

    await tester.enterText(
        find.widgetWithText(TextFormField, 'Applicant Name'), 'Steve');
    await tester.enterText(
        find.widgetWithText(TextFormField, 'Mobile Number'), '0812345678');

    // Tap Next Step
    await tester.tap(find.text('Next Step'));
    await tester.pumpAndSettle();

    // 4. Step 2: Evidence
    expect(find.text('Required Documents'), findsOneWidget);

    // Check if Back works
    await tester.tap(find.text('Back'));
    await tester.pumpAndSettle();
    expect(find.text('Select Establishment'), findsOneWidget);
  });
}
