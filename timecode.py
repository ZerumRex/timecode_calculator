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
    sign = 1
    drop = False

    if frame_in < 0:
        sign = -1
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
    
    f = round(frames % fps)
    s = (frames // fps) % 60
    m = (frames // (fps * 60)) % 60
    h = (frames // (3600 * fps)) % 24

    result_tc = (f + (s * 100) + (m * 10_000) + (h * 1_000_000)) * sign

    return format_tc(int(result_tc), drop)

# Finishes changing frames to drop timecode.  Additional math is needed to account for frame loss.
def drop_frame_tc(frame_in, fps):
    frame_number = frame_in
    drop_frames = round(fps * .066666)
    frames_per_10_minutes = round(fps * 60 * 10)
    ten_min_counter = frame_in // frames_per_10_minutes
    ten_min_counter_mod = fps % frames_per_10_minutes

    if ten_min_counter > drop_frames:
        frame_number = frame_number + (drop_frames * 9 * ten_min_counter) + drop_frames * ((ten_min_counter_mod - drop_frames) // fps)
    else:
        frame_number = frame_number + drop_frames * 9 * ten_min_counter

    return frame_number

# Converts timecode variable int into proper timecode string format
def format_tc(timecode, drop):
    sign = 1

    if(timecode < 0):
        sign = -1
        timecode = timecode * -1

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

    if(sign == -1):
        tc_string = '-' + tc_string

    print(tc_string)

# Adds two timecodes together.
def tc_add(tc_in_1, tc_in_2, fps):
    tc_1 = tc_to_frame(tc_in_1, fps)
    tc_2 = tc_to_frame(tc_in_2, fps)

    if(isinstance(tc_1, int) and isinstance(tc_2, int)):
        return(frame_to_tc(tc_1 + tc_2, fps))
    else:
        if(isinstance(tc_1, int) == False and isinstance(tc_2, int) == False):
            return('Both timecodes were invalid.')
        elif(isinstance(tc_1, int)):
            return('Timecode 2 was invalid.')
        else:
            return('Timecode 1 was invalid.')

# Subtracts two timecodes together.
def tc_sub(tc_in_1, tc_in_2, fps):
    tc_1 = tc_to_frame(tc_in_1, fps)
    tc_2 = tc_to_frame(tc_in_2, fps)

    if(isinstance(tc_1, int) and isinstance(tc_2, int)):
        return(frame_to_tc(tc_1 - tc_2, fps))
    else:
        if(isinstance(tc_1, int) == False and isinstance(tc_2, int) == False):
            return('Both timecodes were invalid.')
        elif(isinstance(tc_1, int)):
            return('Timecode 2 was invalid.')
        else:
            return('Timecode 1 was invalid.')

# Finds the duration between two timecodes.
def tc_duration(start_tc, end_tc, fps):
    if(isinstance(start_tc, int) and isinstance(end_tc, int)):
        if(start_tc <= end_tc):
            tc_1 = tc_to_frame(end_tc, fps)
            tc_2 = tc_to_frame(start_tc, fps)
        else:
            tc_1 = tc_to_frame(start_tc, fps)
            tc_2 = tc_to_frame(end_tc, fps)

        return(frame_to_tc(tc_1 - tc_2, fps))
    else:
        if(isinstance(tc_1, int) == False and isinstance(tc_2, int) == False):
            return('Both timecodes were invalid.')
        elif(isinstance(tc_1, int)):
            return('Timecode 2 was invalid.')
        else:
            return('Timecode 1 was invalid.')

# Multiples a timecode by multiper.
def tc_multiple(tc_in_1, multipler, fps):
    tc_1 = tc_to_frame(tc_in_1, fps)

    if(isinstance(tc_1, int) and isinstance(multipler, int)):
        return(frame_to_tc(tc_1 * multipler, fps))
    else:
        if(isinstance(tc_1, int) == False):
            return('Timecode given was invalid.')

# Divides a timecode by factor.
def tc_divide(tc_in_1, factor, fps):
    tc_1 = tc_to_frame(tc_in_1, fps)

    if(isinstance(tc_1, int) and isinstance(factor, int)):
        return(frame_to_tc(tc_1 / factor, fps))
    else:
        if(isinstance(tc_1, int) == False):
            return('Timecode given was invalid.')

# Converts timecode from one frame rate to another
def tc_conversion(tc_in, start_frame_rate, convert_frame_rate):
    if(isinstance(tc_in, int) == False):
        return('Timecode given was not valid.')
    result_frame = tc_to_frame(tc_in, start_frame_rate)
    if(isinstance(result_frame, int)):
        return(frame_to_tc(result_frame, convert_frame_rate))
    else:
        return(result_frame)

frame_to_tc(87538, 23.98)
tc_to_frame(234615, 23.98)

tc_add(1015, 2025, 29.97)
tc_add(1015, 1015, 24)
tc_sub(1015, 2005, 24)
tc_sub(2005, 1015, 24)
tc_multiple(1015, 2, 24)
tc_divide(2106, 2, 24)

tc_conversion(1002, 24, 25)
tc_to_frame(1012,24)

tc_duration(1015, 2005, 24)
tc_duration(2005, 1015, 24)