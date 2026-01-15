for enc in ['utf-8', 'cp1252']:
    try:
        with open('tsc_output_v4.txt', 'r', encoding=enc) as f:
            lines = f.readlines()
        
        if not lines:
            continue

        print(f"--- SUCCESS RELOADING WITH {enc} ---")
        for line in lines:
            if 'error' in line.lower() or 'TS' in line:
                print(line)
        break
    except Exception as e:
        continue
