import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:lucide_icons/lucide_icons.dart';

class MapPickerScreen extends StatefulWidget {
  final LatLng? initialCenter;

  const MapPickerScreen({super.key, this.initialCenter});

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  late final MapController _mapController;
  late LatLng _currentCenter;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    // Default to Thailand (approx center) if no initial value
    _currentCenter = widget.initialCenter ?? const LatLng(13.7563, 100.5018);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('เลือกพิกัด (Pick Location)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: () {
              Navigator.of(context).pop(_currentCenter);
            },
          )
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentCenter,
              initialZoom: 15.0,
              onPositionChanged: (position, hasGesture) {
                if (position.center != null) {
                  setState(() {
                    _currentCenter = position.center!;
                  });
                }
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.mobile_app',
              ),
            ],
          ),
          const Center(
            child: Icon(
              LucideIcons.mapPin,
              color: Colors.red,
              size: 40,
            ),
          ),
          Positioned(
            bottom: 30,
            left: 20,
            right: 20,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Lat/Long:',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    Text(
                        '${_currentCenter.latitude.toStringAsFixed(6)}, ${_currentCenter.longitude.toStringAsFixed(6)}'),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: () {
                          Navigator.of(context).pop(_currentCenter);
                        },
                        child: const Text('ยืนยันพิกัด (Confirm)'),
                      ),
                    )
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}
