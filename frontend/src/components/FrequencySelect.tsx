"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

type Frequency = {
  id: number | string
  type: string
}

type FrequencySelectProps = {
  value?: string
  onValueChange?: (value: string) => void
}

const FrequencySelect: React.FC<FrequencySelectProps> = ({ value, onValueChange }) => {
  const [frequencies, setFrequencies] = useState<Frequency[]>([])

  useEffect(() => {
    const fetchFrequencies = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/frequency-data/", {
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
