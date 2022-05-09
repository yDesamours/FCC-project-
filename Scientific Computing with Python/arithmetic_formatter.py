def arithmetic_arranger(problems, result = False):
    operationLimit = 5 #max number of operations
    digitLimit = 4 #operande with more digits are not allowed
    space = 4 #separation between operation
    allowed = ['+', '-'] #computes only addition and substrack
    
    numOfOperation = len(problems)
    
    if numOfOperation > operationLimit : 
        return "Error: Too many problems."
        
    first , second, operator, maxlen , results= list(), list(), list(), list(), list()
    operation = None
    
    for item in problems :
        operation = item.split()
        
        if operation[1] not in allowed:
            return "Error: Operator must be '+' or '-'."
            
        try :
            int(operation[0])
            int(operation[2])
        except :
            return "Error: Numbers must only contain digits."
            
        if len(operation[0]) > digitLimit or len(operation[2]) > digitLimit :
            return "Error: Numbers cannot be more than four digits."
         
        maxlen.append(max(len(operation[0]) + 2, len(operation[2]) + 2))   
        first.append(operation[0])
        second.append(operation[2])
        operator.append(operation[1])
        if result:
            results.append(str(eval(item)))
        
    line1, line2, line3 , line4= '', '', '', ''
    i = 0
    while i < numOfOperation:
        line1 = line1 + ' '*(maxlen[i] - len(first[i])) + first[i] + ' '*space
        line2 = line2 + operator[i] + ' '*(maxlen[i] -len(second[i]) - 1) +second[i] + ' '*space
        line3 = line3 + '-'*maxlen[i] + ' '*space
        if result :
            line4 = line4 + ' '*(maxlen[i] - len(results[i])) + results[i] + ' '*space
        i = i+1

    line1 = line1.rstrip()
    line2 = line2.rstrip()
    line3 = line3.rstrip()
    line4 = line4.rstrip()

    if result :
      arranged_problems=f'{line1}\n{line2}\n{line3}\n{line4}'
    else :
      arranged_problems=f'{line1}\n{line2}\n{line3}'
  
    return arranged_problems
