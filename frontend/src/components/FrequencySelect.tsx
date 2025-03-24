"use client"

import React, { useEffect, useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import api from "@/axiosConfig"

type Frequency = {
  id: number | string
  type: string
}

type FrequencySelectProps = {
  value: string // Agora é obrigatório para evitar valores indefinidos
  onValueChange: (value: string) => void // Agora é obrigatório
}

const FrequencySelect: React.FC<FrequencySelectProps> = ({ value, onValueChange }) => {
  const [frequencies, setFrequencies] = useState<Frequency[]>([])

  useEffect(() => {
    const fetchFrequencies = async () => {
      try {
        const response = await api.get("/frequency-data/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        console.log(response.data.frequencies)
        setFrequencies(response.data.frequencies)
      } catch (error) {
        console.error("Erro ao buscar dados de frequência", error)
      }
    }

    fetchFrequencies()
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione a frequência" />
      </SelectTrigger>
      <SelectContent>
        {frequencies.map((freq) => (
          <SelectItem key={freq.id} value={freq.type}>
            {freq.type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default FrequencySelect
