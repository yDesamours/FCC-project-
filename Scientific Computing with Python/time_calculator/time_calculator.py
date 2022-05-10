def add_time(start, duration, day=None):
    oneDay = 24 * 60 * 60
    days = ['Monday', 'tuesday', 'Wednesday', 'Thursday', 'Friday', 'saturDay', 'Sunday']
    #getting hours, minutes and meridian
    fullStartTime = start.split()
    startTime = fullStartTime[0].split(':')
    durationTime = duration.split(':')

    startTime[0] = int(startTime[0])
    startTime[1] = int(startTime[1])
    durationTime[0] = int(durationTime[0])
    durationTime[1] = int(durationTime[1])

    if(fullStartTime[1] == 'PM'):
        startTime[0] = startTime[0] + 12
        
    startSeconds = (startTime[0] * 60 + startTime[1]) * 60
    toOtherDay = oneDay - startSeconds
    
    endSeconds = startSeconds + (durationTime[0] * 60 + durationTime[1]) * 60 
    
    dayPass = endSeconds // oneDay
    hour = (endSeconds - dayPass * oneDay) // 3600
    minute = (endSeconds -( dayPass * oneDay + hour * 3600 )) // 60 
    meridian ='AM'
    
    if(hour > 11):
        meridian = 'PM'
        hour = hour - 12
    if(hour == 0):
        hour = 12
    if(minute < 10):
        minute = '0' + str(minute)
    
    
    howMany = ""
    if dayPass == 1:
        howMany = "(next day)"
    elif dayPass > 1:
        howMany = f"({dayPass} days later)"
    
    endDay = ''
    if day :
        for i in days:
            if i == day :
                index = days.index(i)
                j = 0
                while j < dayPass :
                    index = index + 1
                    j = j + 1
                    if index > 6:
                        index = 0
                endDay = days[index]
                break
    if day :
        new_time = f"{hour}:{minute} {meridian}, {endDay} {howMany}"
    else:
        new_time = f"{hour}:{minute} {meridian} {howMany}"
        
    return new_time.strip()
