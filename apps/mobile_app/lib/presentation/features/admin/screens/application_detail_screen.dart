import 'package:flutter/material.dart';

class ApplicationDetailScreen extends StatelessWidget {
  final String applicationId;
  const ApplicationDetailScreen({super.key, required this.applicationId});
  @override
  Widget build(BuildContext context) {
    return Scaffold(body: Center(child: Text('App Detail: $applicationId')));
  }
}
