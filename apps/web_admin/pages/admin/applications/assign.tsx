                            <button
                                onClick={handleAssign}
                                disabled={!selectedAuditorId}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                Confirm Assignment
                            </button>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div >
                    </div >
                </div >
            )}
        </div >
    );
}
