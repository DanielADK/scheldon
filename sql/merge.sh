#!/bin/bash

dir="./"
output_file="example-data.sql"
echo "" > $output_file
# File list
files=(
"Triggers.sql"
"Subjects.sql"
"Employees.sql"
"Rooms.sql"
"Classes.sql"
"Students.sql")
for file in "${files[@]}"
do
  if [ -f "$dir/$file" ]; then
    cat "$dir/$file" >> $output_file
    echo "" >> $output_file
  else
    echo "File $dir/$file doesn't exist."
  fi
done