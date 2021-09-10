/**
 * 
 * Simple timecode calculator for gDocs spreadshet. Heavily inspired by Matthias Bürcher's Microsoft's Excel macro, which was introduced to me by Jerome Raim.  As well as Henrik Cednert, where I found a version of the Google script. Converted it for no use of ""
 * 
 * Works with both manually entered data and cell references. 
 *
 * Supported framerates: Any integer frame rate such as 24, 25, 30, 60. 29.97 (consider drop frame), 30 (considered 29.97 non-drop), 59.94, 60 (considered 59.94 non-drop). 
 *
 * Timecode formatting is handled by Google Sheets.  
 * Goto 'Format' -> 'Number' -> 'More Formats' -> 'Custom number format...'
 * Type '00 \: 00 \: 00 \: 00' or '00 \: 00 \: 00 \; 00' for drop frame annotation
 *
 * @version v1.0
 * @author Sebastian
 *
 * Changelog
 * 2019-03-20, v1.0.  Got the thing working.
 *             v1.*   Add error checking.
 *
 */

/**
 * A timecode calculator converting timecode to frame number. 
 *   *
 * @param {0108100} tcIN The first timecode, alway a timecode number or cell reference. I.E. "01:08:10:01", A4.
 * @param {24} fps Source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function TCtoFrame(tcIn, fps)
{
  var sign = 1;
  drop = false;
  var frames;
   if(isNaN(tcIn) )
  {
    tcIn = removeTCFormat_(tcIn);
  }
 
  if(tcIn < 0)
  {
    sign = -1;
    tcIn = -1 * tcIn;
  }
  if(fps == 23.98 || fps == 23.976)
    fps = 24;
  else if (fps == 29.97)
  {
    drop = true;
    fps = 30;
  }
  else if (fps == 59.94)
  {
    drop = true;
    fps = 60;
  }
    
  f = Math.round(tcIn % 100);
  s = Math.floor(((tcIn / 100) % 100));
  m = Math.floor(((tcIn / 10000) % 100));
  h = Math.floor((tcIn / 1000000));
  
  if(f >= fps)
    return "Error. Timecode given is higher than framerate allows.";
  
  if(!drop)
    frames = (f + fps * (s + 60 * m + 3600 * h)) * sign;
  else
    frames = dropTCtoFrame_(f,s,m,h,fps);
    
  return frames;
}
/*
 *Finishes changing drop Timecode to frames.  Additional math is need to account for loss frames.
*/
function dropTCtoFrame_(frames, seconds, minutes, hours, fps)
{
    
    //var framerate = frame_rate;
   
    var droppedFrames = Math.round(fps * .066666);       //Number of drop frames is 6% of framerate rounded to nearest integer
    //var timeBase = Math.round(framerate);             //We don't need the exact framerate anymore, we just need it rounded to nearest integer
    
    var hourFrames = fps * 60 * 60;              //Number of frames per hour (non-drop)
    var minuteFrames = fps * 60;                 //Number of frames per minute (non-drop)
    var totalMinutes = (60 * hours) + minutes;        //Total number of minutes
    var dropFrames = ((hourFrames * hours) + (minuteFrames * minutes) + (fps * seconds) + frames) - (droppedFrames * (totalMinutes - Math.floor(totalMinutes / 10)));
     
    return dropFrames;   
}

/**
 * A timecode calculator converting frame number to timecode at given frame rate. 
 *   *
 * @param {18283} frameIn the frame number, alway a number or cell reference. I.E. "18283", A4.
 * @param {24} fps Source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function FrametoTC(frameIn, fps)
{
  var sign = 1;
  var frames = frameIn;
  
  if(frameIn < 0)
  {
    sign = -1;
    frames = -1 * frameIn;
  }
  if(fps == 23.98 || fps == 23.976)
    fps = 24;
  else if (fps == 29.97)
  {
    fps = 30;
    frames = dropFrameTC_(frames, fps);
  }
  else if (fps == 59.94)
  {
    fps = 60;
    frames = dropFrameTC_(frames, fps);
  }
  
  f = Math.round(frames % fps);
  s = Math.floor(frames / Math.round(fps)) % 60;
  m = Math.floor( (frames / (fps * 60)) % 60);
  h = Math.floor(frames / (3600 * fps) % 24); 

  var resultTC = f + (s * 100) + (m * 10000) + (1000000 * h);

  return resultTC;
}
/*
 *Finishes changing frames to drop timecode.  Additional math is need to account for loss frames.
*/
function dropFrameTC_(frameIn, fps)
{
  var frameNumber = frameIn;
  var dropFrames = Math.round(fps * .066666);
  var framesPer10Minutes =  Math.round(fps * 60 * 10);
  var TenMinCounter = Math.floor(frameIn / framesPer10Minutes);
  var TenMinCounter_mod = fps % framesPer10Minutes;
  
  if (TenMinCounter_mod > dropFrames)   
    frameNumber = frameNumber + (dropFrames * 9 * TenMinCounter) + dropFrames * (Math.floor((TenMinCounter_mod - dropFrames) / fps));
  else
    frameNumber = frameNumber + dropFrames * 9 * TenMinCounter;
  
  return frameNumber;
}
/**
 * Removes text timecode formating
 *   *
 * @param {01:00:00:00} timecode, written timecode or cell reference. I.E. "01:08:10:01", A4.
 * @customfunction
 */
function removeTCFormat_(timecode)
{
  var new_timecode = timecode.replace(/:/g, "");
  var new_int_timecode = Number(new_timecode);
  return new_int_timecode;
}
/*
 *Finishes changing frames to drop timecode.  Additional math is need to account for loss frames.
*/
function checkTC(tc, fps)
{
}

/* Math funcions located below.
 * Addition
 * Subtraction
 * Multiplication
 * Division
 * Duration
 * Sum
 * Converstion of frame rate
*/

/**
 * A timecode calculator which adds two timecodes together. 
 *   *
 * @param {0108100} tcIn_1 the first timecode, alway a timecode number or cell reference. I.E. "01:08:10:01", A4.
 * @param {00101512} tcIn_2 the second timecode, alway a timecode number or cell reference. I.E. "00:10:15:12", B4.
 * @param {24} fps Source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function TCAdd(tcIn_1, tcIn_2, fps)
{
  var tc_1 = TCtoFrame(tcIn_1, fps);
  var tc_2 = TCtoFrame(tcIn_2, fps);
  if(!isNaN(tc_1) && !isNaN(tc_2))
  {
    var resultFrame = tc_1 + tc_2;
    var resultTC = FrametoTC(resultFrame, fps);
    return resultTC;
  }
  else
  {
    if(isNaN(tc_1))
      return tc_1 + "\nTimecode 1";
    else 
      return tc_2 + "\nTimecode 2";
  }
}
/**
 * A timecode calculator which subtracts two timecodes together. 
 *   *
 * @param {0108100} tcIn_1 the first timecode, alway a timecode number or cell reference. I.E. "01:08:10:01", A4.
 * @param {00101512} tcIn_2 the second timecode, alway a timecode number or cell reference. I.E. "00:10:15:12", B4.
 * @param {24} fps Source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function TCSub(tcIn_1, tcIn_2, fps)
{
  var tc_1 = TCtoFrame(tcIn_1, fps);
  var tc_2 = TCtoFrame(tcIn_2, fps);
  if(!isNaN(tc_1) && !isNaN(tc_2))
  {
    var resultFrame = tc_1 - tc_2;
    var resultTC = FrametoTC(resultFrame, fps);
    return resultTC;
  }
  else
  {
    if(isNaN(tc_1))
      return tc_1 + "\nTimecode 1";
    else 
      return tc_2 + "\nTimecode 2";
  }
}
/**
 * A timecode calculator which takes a timecode and multiples it by the given multipler at the given frame rate. 
 *   *
 * @param {0108100} tcIn the first timecode, alway a timecode number or cell reference. I.E. "01:08:10:01", A4.
 * @param {2} multipler alway a number or cell reference. I.E. "2", B4.
 * @param {24} fps Source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function TCMultiple(tcIn, multiplier, fps)
{
  var tc_1 = TCtoFrame(tcIn, fps);
  if(!isNaN(tc_1) && !isNaN(multiplier))
  {
    var resultFrame = tc_1 * multiplier;
    var resultTC = FrametoTC(resultFrame, fps);
    return resultTC;
  }
  else
  {
    if(isNaN(tc_1))
      return tc_1;
    else 
      return "Multiplier was not a number";
  }
}
/**
 * A timecode calculator which takes a timecode and divides it by the given factor at the given frame rate. 
 *   *
 * @param {0108100} tcIn the first timecode, alway a timecode number or cell reference. I.E. "01:08:10:01", A4.
 * @param {2} factor alway a number or cell reference. I.E. "2", B4.
 * @param {24} fps Source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function TCDivide(tcIn, factor, fps)
{
  var tc_1 = TCtoFrame(tcIn, fps);
  if(!isNaN(tc_1) && !isNaN(factor))
  {
    var resultFrame = tc_1 / factor;
    var resultTC = FrametoTC(resultFrame, fps);
    return resultTC;
  }
  else
  {
    if(isNaN(tc_1))
      return tc_1;
    else 
      return "Factor was not a number";
  }
}
/**
 * A timecode calculator which finds the duration between two timecodes at the given frame rate. 
 *   *
 * @param {0108100} startTC the first timecode, alway a timecode number or cell reference. I.E. "01:08:10:01", A4.
 * @param {01101512} endTC the second timecode, alway a timecode number or cell reference. I.E. "01:10:15:12", B4.
 * @param {24} fps Source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function TCDuration(startTC, endTC, fps)
{
  var start = TCtoFrame(startTC, fps);
  var end = TCtoFrame(endTC, fps);
  if(!isNaN(start) && !isNaN(end))
  {
    var resultFrame = end - start;
    var resultTC = FrametoTC(resultFrame, fps);
    return resultTC;
  }
  else
  {
    if(isNaN(start))
      return start + "\nStart timecode";
    else 
      return end + "\nEnd timecode";
  }
}
/**
 * A timecode calculator which adds range of timecodes together. 
 *   *
 * @param rangeTCIn range of timecodes alway a cell range. I.E. A4:A44.
 * @param {24} fps Source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function TCSum(rangeTCIn, fps)
{
  var resultFrame = 0;
  if(!rangeTCIn.map)
    return -1;
  for(var i = 0; i < rangeTCIn.length; i++)
  {
    for(var j = 0; j < rangeTCIn[i].length; j++)
    {
      if(rangeTCIn[i][j] == '')
        var checkTC = TCtoFrame(0, 24);
      else
        var checkTC = TCtoFrame(parseInt(rangeTCIn[i][j]), fps);
      if(!isNaN(checkTC))
        resultFrame = resultFrame + checkTC;
      else
        return checkTC + "Error. Input error.  Check all timecodes given";
    }
  }
  var resultTC = FrametoTC(resultFrame, fps);
  return resultTC;
}
/**
 * A timecode calculator which converts given timecode from one frame rate to another. 
 *   *
 * @param {0108100} tcIN is timecode, alway a timecode number or cell reference. I.E. "01:08:10:01", A4.
 * @param {24} startFrameRate source framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @param {25} ConvertedFrameRate converted framerate. I.E., 23.98, 24, 25, 29.97 (drop frame), 30 (29.97 non-drop frame), 59.94 (drop frame) 60 (59.94 non-drop frame).
 * @customfunction
 */
function TCConversion(tcIn, startFrameRate, ConvertedFrameRate)
{
  if(isNaN(tcIn))
     return "Timecode is not valid";
  var resultFrame = TCtoFrame(tcIn, startFrameRate);
  if(!isNaN(resultFrame))
  {
    var resultTC = FrametoTC(resultFrame, ConvertedFrameRate);
    return resultTC;
  }
  else
    return resultFrame;
}
