// dart format width=80
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_import, prefer_relative_imports, directives_ordering

// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AppGenerator
// **************************************************************************

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:mobile_app/presentation/features/application/screens/application_form_screen.dart'
    as _mobile_app_presentation_features_application_screens_application_form_screen;
import 'package:mobile_app/presentation/features/application/screens/guidelines_screen.dart'
    as _mobile_app_presentation_features_application_screens_guidelines_screen;
import 'package:mobile_app/presentation/features/application/screens/service_selection_screen.dart'
    as _mobile_app_presentation_features_application_screens_service_selection_screen;
import 'package:widgetbook/widgetbook.dart' as _widgetbook;

final directories = <_widgetbook.WidgetbookNode>[
  _widgetbook.WidgetbookFolder(
    name: 'presentation',
    children: [
      _widgetbook.WidgetbookFolder(
        name: 'features',
        children: [
          _widgetbook.WidgetbookFolder(
            name: 'application',
            children: [
              _widgetbook.WidgetbookFolder(
                name: 'screens',
                children: [
                  _widgetbook.WidgetbookComponent(
                    name: 'ApplicationFormScreen',
                    useCases: [
                      _widgetbook.WidgetbookUseCase(
                        name: 'New Application',
                        builder:
                            _mobile_app_presentation_features_application_screens_application_form_screen
                                .applicationFormUseCase,
                      ),
                      _widgetbook.WidgetbookUseCase(
                        name: 'Renewal',
                        builder:
                            _mobile_app_presentation_features_application_screens_application_form_screen
                                .applicationFormRenewUseCase,
                      ),
                      _widgetbook.WidgetbookUseCase(
                        name: 'Replacement',
                        builder:
                            _mobile_app_presentation_features_application_screens_application_form_screen
                                .applicationFormSubstituteUseCase,
                      ),
                    ],
                  ),
                  _widgetbook.WidgetbookLeafComponent(
                    name: 'GuidelinesScreen',
                    useCase: _widgetbook.WidgetbookUseCase(
                      name: 'Default',
                      builder:
                          _mobile_app_presentation_features_application_screens_guidelines_screen
                              .guidelinesScreenUseCase,
                    ),
                  ),
                  _widgetbook.WidgetbookLeafComponent(
                    name: 'ServiceSelectionScreen',
                    useCase: _widgetbook.WidgetbookUseCase(
                      name: 'Default',
                      builder:
                          _mobile_app_presentation_features_application_screens_service_selection_screen
                              .serviceSelectionScreenUseCase,
                    ),
                  ),
                ],
              )
            ],
          )
        ],
      )
    ],
  )
];
