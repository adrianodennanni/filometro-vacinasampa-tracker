require 'csv'
require 'digest/md5'
require 'json'
require 'net/http'
require 'set'
require 'uri'

# Method for cleaning strings
NO_CAPS = ['AMA', 'AMA/UBS', 'CEP', 'CEP:', 'CSE', 'CPTM', 'UBS', 'UVIS']
class String
  def titleize
    self.split(' ').map{|word| NO_CAPS.include?(word) ? word :  word.capitalize }.join(' ')
  end
end

# Access the target website and parse the response
def get_data
  uri = URI('https://deolhonafila.prefeitura.sp.gov.br/processadores/dados.php')
  res = Net::HTTP.post_form(uri, dados: 'dados')

  raise 'Unexpected HTTP response' unless res.kind_of?(Net::HTTPSuccess)

  JSON.load(res.body)
end

# Try up to 5 times
retries = 0
data = nil
begin
  data = get_data
rescue
  sleep 5
  retry if (retries += 1) < 5
end
exit(1) if data.nil?

# Start to clean the data
unities = []
situations = []
data.each do |unity|
  unity_id = Digest::MD5.hexdigest(unity['equipamento'])

  unities.push({
    id:       unity_id,
    nome:     unity['equipamento'].titleize,
    endereco: unity['endereco'].titleize,
    tipo:     unity['tipo_posto'].titleize,
    distrito: unity['distrito'].titleize,
    regiao:   unity['crs'].titleize
  })

  # Save the unity queue information
  CSV.open("./data/unities/#{unity_id}.csv", mode = 'a') do |csv|
    csv << [DateTime.now.iso8601, unity['indice_fila'] == '5' ? 0 : unity['indice_fila'].to_i]
  end
end

# Sort alphabetically per unity name
unities.sort_by! { |hsh| hsh[:nome] }

# Save unities data as JSON
File.write('./data/unities.json', unities.to_json)
