#!/bin/sh

input="./logfile.txt"

declare -a array

while IFS= read -r line
do
 array+=("$(echo "$line")")
done < "$input"

echo "Configuracion de Cambios"

echo "Precio del Sol Peruano (PEN)"
read  -i ${array[0]} -e PEN

echo "Precio del Dolar Americano (USD)"
read  -i ${array[1]} -e USD

echo "Precio del Peso Colombiano (COP)"
read  -i ${array[2]} -e COP

echo "Precio del Peso Chileno (CLP)"
read  -i ${array[3]} -e CLP

echo "Precio del Colon Costarricense (CRC)"
read  -i ${array[4]} -e CRC

echo "Precio del Peso Argentino (ARS)"
read  -i ${array[5]} -e ARS


echo "Precio del Real Brazileño (BRL)"
read  -i ${array[6]} -e BRL

echo "Precio del Dolar Paypal (USD)"
read  -i ${array[7]} -e USD2


echo "Nuevos Cambios Configurados"

echo "$PEN
$USD
$COP
$CLP
$CRC
$ARS
$BRL
$USD2" | tee logfile.txt


node ./flayers.js $PEN $USD $COP $CLP $CRC $ARS $BRL $USD2