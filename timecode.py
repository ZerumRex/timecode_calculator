# Timecode calculator for converting time to frame number.
def tc_to_frame(tc_in, fps):
    sign = 1
    drop = False

    if tc_in < 0:
        sign = -1
        tc_in = -1 * tc_in

    if fps == 23.98 or fps == 23.976:
        fps = 24
    elif fps == 29.97:
        drop = True
        fps = 30
    elif fps == 59.94:
        drop = True
        fps = 60

    f = tc_in % 100
    s = ((tc_in // 100) % 100)
    m = ((tc_in // 10_000) % 100)
    h = ((tc_in // 1_000_000) % 100)

    if f >= fps:
        return 'Error. Timecode given is higher than framerate allows.'

    if not drop:
        frames = (f + fps * ( s + 60 * m + 3600 * h)) * sign
    else:
        frames = drop_tc_to_frame(f, s, m, h, fps)

    return frames

# Finishes changing Timecode to fremes.  Additional math is needed to address frame loss.
def drop_tc_to_frame(frames, seconds, minutes, hours, fps):
    dropped_frames = round(fps * .066666)

    hour_frames = fps * 60 * 60
    minute_frames = fps * 60
    total_minutes = (60 * hours) + minutes
    drop_frame = ((hour_frames * hours) + (minute_frames * minutes) + (fps * seconds) + frames) - (dropped_frames * (total_minutes - (total_minutes // 10)))

    return drop_frame

# Timecode calculator for converting frame number to timecode at given frame rate
def frame_to_tc(frame_in, fps):
    frames = frame_in
    drop = False

    if frame_in < 0:
        frames = -1 * frame_in
    
    if fps == 23.98 or fps == 23.976:
        fps = 24
    elif fps == 29.97:
        fps = 30
        drop = True
        frames = drop_frame_tc(frames, fps)
    elif fps == 59.94:
        fps = 60
        drop = True
        frames = drop_frame_tc(frames, fps)
    
    f = frames % fps
    s = (frames // fps) % 60
    m = (frames // (fps * 60)) % 60
    h = (frames // (3600 * fps)) % 24

    result_tc = f + (s * 100) + (m * 10_000) + (h * 1_000_000)

    return format_tc(result_tc, drop)

# Finishes changing frames to drop timecode.  Additional math is needed to account for frame loss.
def drop_frame_tc(frame_in, fps):
    frame_number = frame_in
    drop_frames = round(fps * .066666)
    frames_per_10_minutes = fps * 60 * 10
    ten_min_counter = frame_in / frames_per_10_minutes
    ten_min_counter_mod = fps % frames_per_10_minutes

    if ten_min_counter > drop_frames:
        frame_number = frame_number + (drop_frames * 9 * ten_min_counter) + drop_frames * ((ten_min_counter_mod - drop_frames) // fps)
    else:
        frame_number = frame_number + drop_frames * 9 * ten_min_counter

    return format_tc(frame_number, drop)

# Converts timecode variable int into proper timecode string format
def format_tc(timecode, drop):
    tc_string = str(timecode)
    i = 1

    if len(tc_string) < 8:
        tc_string = '0' * (8 - len(tc_string)) + tc_string

    while i < len(tc_string):
        if drop == True and i == 2:
            tc_string = tc_string[:-i] + ';' + tc_string[-i:]
        elif drop == False and i == 2:
            tc_string = tc_string[:-i] + ':' + tc_string[-i:]
        elif i == 5:
            tc_string = tc_string[:-i] + ':' + tc_string[-i:]
        elif i == 8:
            tc_string = tc_string[:-i] + ':' + tc_string[-i:]
        i += 1

    print(tc_string)



frame_to_tc(87538, 23.98)
tc_to_frame(2346, 23.98)